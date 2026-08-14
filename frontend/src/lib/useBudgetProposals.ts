/**
 * useBudgetProposals.ts — Unified data hook for budget proposals.
 *
 * Consumed by both /budget (public card view) and /dashboard/budget-proposals
 * (authenticated table view). A single implementation ensures both pages show
 * identical data and voting state at all times.
 *
 * Features:
 *   - Live API fetch with honest mock fallback (same pattern as prior runtime-hardening pass)
 *   - Optimistic vote + server confirm + rollback-on-failure
 *   - localStorage backing for resilience/offline (key: civic_voice_budget_proposals)
 *   - Durable per-user hasVoted (key: civic_voice_voted_proposals, keyed by user.id)
 *   - Cross-tab sync via the browser storage event
 *   - Fully Funded status when current_votes >= target_votes
 *   - Auth-gate: voteOnProposal returns early if no authenticated user
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getProjects, voteForProject, getStats } from "@/lib/api";
import type { ProjectOut, StatsOut } from "@/lib/api";
import { useLiveUpdates } from "@/lib/ws";
import type { LiveEvent } from "@/lib/ws";
import { useAuth } from "@/lib/auth";
import { MOCK_BUDGET_PROPOSALS } from "@/lib/mock-data";

// ── Storage keys ──────────────────────────────────────────────────────────────

const PROPOSALS_KEY = "civic_voice_budget_proposals";
const VOTED_KEY = "civic_voice_voted_proposals";
const DEMO_CITIZEN_ID = "demo-voter-001";

// ── Types ─────────────────────────────────────────────────────────────────────

type VotedMap = Record<string, string[]>; // { [userId]: proposalId[] }

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadProposalsFromStorage(): ProjectOut[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROPOSALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveProposalsToStorage(proposals: ProjectOut[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
  } catch (e) {
    console.warn("[useBudgetProposals] Failed to save proposals:", e);
  }
}

function loadVotedMap(): VotedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveVotedMap(map: VotedMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("[useBudgetProposals] Failed to save voted map:", e);
  }
}

function hasUserVotedFor(userId: string, proposalId: string): boolean {
  const map = loadVotedMap();
  return (map[userId] ?? []).includes(proposalId);
}

function markUserVoted(userId: string, proposalId: string): void {
  const map = loadVotedMap();
  const arr = map[userId] ?? [];
  if (!arr.includes(proposalId)) {
    map[userId] = [...arr, proposalId];
    saveVotedMap(map);
  }
}

function unmarkUserVoted(userId: string, proposalId: string): void {
  const map = loadVotedMap();
  map[userId] = (map[userId] ?? []).filter((id) => id !== proposalId);
  saveVotedMap(map);
}

/** Map MOCK_BUDGET_PROPOSALS seed data → ProjectOut shape (mirrors budget/page.tsx logic). */
function mapMockProposals(): ProjectOut[] {
  return MOCK_BUDGET_PROPOSALS.map((bp) => {
    let currentVotes = 0;
    if (bp.votes?.endsWith("K")) {
      currentVotes = Math.round(parseFloat(bp.votes.replace("K", "")) * 1000);
    } else {
      currentVotes = parseInt(bp.votes, 10) || 0;
    }

    let budgetAllocated = 0;
    if (bp.estimatedCost?.includes("Lakhs")) {
      budgetAllocated = Math.round(
        parseFloat(bp.estimatedCost.replace(/[^\d.]/g, "")) * 100_000
      );
    } else {
      budgetAllocated = parseInt(bp.estimatedCost?.replace(/[^\d]/g, ""), 10) || 0;
    }

    const support = bp.supportPct ?? 50;
    const targetVotes = Math.round(currentVotes / (support / 100 || 0.5));

    let category = "OTHER";
    const titleLower = (bp.title ?? "").toLowerCase();
    if (titleLower.includes("road") || titleLower.includes("pothole")) category = "ROADS";
    else if (titleLower.includes("drain") || titleLower.includes("water")) category = "WATER";
    else if (titleLower.includes("light") || titleLower.includes("electr")) category = "ELECTRICITY";
    else if (titleLower.includes("waste") || titleLower.includes("clean") || titleLower.includes("garbage")) category = "SANITATION";

    return {
      id: bp.id ?? Math.random().toString(36).substring(7),
      title: bp.title ?? "Untitled Proposal",
      description: `Community-proposed initiative: ${bp.title ?? "Untitled"}. Estimated budget required is ${bp.estimatedCost ?? "TBD"}.`,
      budget_allocated: budgetAllocated,
      target_votes: targetVotes || 1000,
      current_votes: currentVotes,
      category,
      status: currentVotes >= (targetVotes || 1000) ? "FUNDED" : "VOTING",
      created_at: new Date().toISOString(),
    } as ProjectOut;
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseBudgetProposalsReturn {
  projects: ProjectOut[];
  stats: StatsOut | null;
  loading: boolean;
  error: string | null;
  dataSource: "live" | "mock";
  isVotingId: string | null;
  isAuthenticated: boolean;
  hasVotedFor: (proposalId: string) => boolean;
  voteOnProposal: (proposalId: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useBudgetProposals(): UseBudgetProposalsReturn {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"live" | "mock">("live");
  const [isVotingId, setIsVotingId] = useState<string | null>(null);

  // Ref to track current projects for use in event handler without stale closure
  const projectsRef = useRef<ProjectOut[]>([]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);

  // ── Load data ──────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [proj, st] = await Promise.all([getProjects(), getStats()]);
      const list = proj ?? [];
      setProjects(list);
      setStats(st ?? null);
      setDataSource("live");
      saveProposalsToStorage(list);
    } catch (err) {
      console.error("[useBudgetProposals] Live fetch failed, falling back to local/mock.", err);

      // Try localStorage cache first, then mock seed
      const cached = loadProposalsFromStorage();
      const mapped = cached ?? mapMockProposals();
      setProjects(mapped);
      setDataSource("mock");
      setError("Showing sample data — live proposals unavailable");

      const fallbackStats: StatsOut = {
        total_reported: 1248,
        auto_deduplicated: 342,
        resolved_percent: 71.5,
        by_category: [
          { category: "SANITATION", count: 420 },
          { category: "ROADS", count: 310 },
          { category: "ELECTRICITY", count: 280 },
          { category: "WATER", count: 180 },
          { category: "OTHER", count: 58 },
        ],
      };
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── WebSocket: sync vote counts from other users ────────────────────────────

  const handleLiveEvent = useCallback((event: LiveEvent) => {
    if (event.event === "project_vote") {
      const updated = event.data as unknown as ProjectOut;
      setProjects((prev) => {
        const next = (prev ?? []).map((p) => (p.id === updated.id ? updated : p));
        saveProposalsToStorage(next);
        return next;
      });
    }
  }, []);

  useLiveUpdates(handleLiveEvent);

  // ── Cross-tab sync via storage event ───────────────────────────────────────
  // The `storage` event fires in OTHER tabs when localStorage changes.
  // We only read here — never write within this handler — to prevent loops.

  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key === PROPOSALS_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setProjects(updated);
          }
        } catch {/* ignore malformed */}
      }
      // voted map changes don't need to update projects state,
      // but hasVotedFor() reads directly from storage so it's always fresh.
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // ── hasVotedFor ────────────────────────────────────────────────────────────

  const hasVotedFor = useCallback(
    (proposalId: string): boolean => {
      if (!user?.id) return false;
      return hasUserVotedFor(user.id, proposalId);
    },
    [user?.id]
  );

  // ── voteOnProposal ─────────────────────────────────────────────────────────

  const voteOnProposal = useCallback(
    async (proposalId: string): Promise<void> => {
      if (!user?.id) return; // auth-gate — caller should show sign-in prompt
      if (hasUserVotedFor(user.id, proposalId) || isVotingId) return;

      // Optimistic update
      setProjects((prev) => {
        const next = (prev ?? []).map((p) => {
          if (p.id !== proposalId) return p;
          const newVotes = (p.current_votes ?? 0) + 1;
          return {
            ...p,
            current_votes: newVotes,
            status: newVotes >= (p.target_votes ?? 0) ? "FUNDED" : p.status,
          } as ProjectOut;
        });
        saveProposalsToStorage(next); // persist optimistic state immediately
        return next;
      });
      markUserVoted(user.id, proposalId);
      setIsVotingId(proposalId);

      try {
        const citizenId = user.id ?? DEMO_CITIZEN_ID;
        const updated = await voteForProject(proposalId, citizenId);
        setProjects((prev) => {
          const next = (prev ?? []).map((p) => (p.id === updated.id ? updated : p));
          saveProposalsToStorage(next);
          return next;
        });
      } catch (err) {
        console.error("[useBudgetProposals] Vote API failed, rolling back:", err);
        // Rollback optimistic update
        unmarkUserVoted(user.id, proposalId);
        setProjects((prev) => {
          const next = (prev ?? []).map((p) => {
            if (p.id !== proposalId) return p;
            return {
              ...p,
              current_votes: Math.max(0, (p.current_votes ?? 1) - 1),
            };
          });
          saveProposalsToStorage(next);
          return next;
        });
        // Surface error toast — re-throw so consumer can show it
        throw err;
      } finally {
        setIsVotingId(null);
      }
    },
    [user?.id, isVotingId]
  );

  return {
    projects,
    stats,
    loading,
    error,
    dataSource,
    isVotingId,
    isAuthenticated: !!user,
    hasVotedFor,
    voteOnProposal,
    reload: load,
  };
}
