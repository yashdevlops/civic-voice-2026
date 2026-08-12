export const dynamic = 'force-dynamic';
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Vote, TrendingUp, IndianRupee, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getProjects, voteForProject, getStats } from "@/lib/api";
import type { ProjectOut, StatsOut } from "@/lib/api";
import { useLiveUpdates } from "@/lib/ws";
import type { LiveEvent } from "@/lib/ws";
import { cn, formatRupees, categoryClass } from "@/lib/utils";

// Demo citizen for voting — in production this comes from auth
const DEMO_CITIZEN_ID = "demo-voter-001";

export default function BudgetPage() {
  const { t } = useI18n();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [proj, st] = await Promise.all([getProjects(), getStats()]);
      setProjects(proj);
      setStats(st);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live updates: sync vote counts from other users
  const handleLiveEvent = useCallback((event: LiveEvent) => {
    if (event.event === "project_vote") {
      const updated = event.data as unknown as ProjectOut;
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  }, []);

  useLiveUpdates(handleLiveEvent);

  async function handleVote(projectId: string) {
    if (voted.has(projectId) || votingId) return;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newVotes = p.current_votes + 1;
        return {
          ...p,
          current_votes: newVotes,
          status: newVotes >= p.target_votes ? "FUNDED" : p.status,
        } as ProjectOut;
      })
    );
    setVoted((prev) => new Set(prev).add(projectId));
    setVotingId(projectId);

    try {
      const updated = await voteForProject(projectId, DEMO_CITIZEN_ID);
      // Reconcile with server response
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      // Revert optimistic update on failure
      setVoted((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return { ...p, current_votes: p.current_votes - 1 };
        })
      );
    } finally {
      setVotingId(null);
    }
  }

  const STATUS_LABELS: Record<string, string> = {
    VOTING: t.projectVoting,
    FUNDED: t.projectFunded,
    PROPOSED: "Proposed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-civic text-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-civic">
              <Vote className="h-5 w-5 text-ink" />
            </div>
            <div>
              <h1 className="font-slab text-2xl sm:text-3xl font-semibold">{t.budgetTitle}</h1>
              <p className="text-white/60 text-sm mt-0.5">{t.budgetSubtitle}</p>
            </div>
          </div>

          {/* Complaint-derived stats row */}
          {stats && (
            <div className="mt-5 flex flex-wrap gap-4">
              {stats.by_category.map((row) => (
                <div
                  key={row.category}
                  className="flex items-center gap-2 bg-white/10 rounded px-3 py-1.5"
                >
                  <span className={cn("h-2 w-2 rounded-full", {
                    "bg-green-400": row.category === "SANITATION",
                    "bg-yellow-400": row.category === "ROADS",
                    "bg-purple-400": row.category === "ELECTRICITY",
                    "bg-blue-400": row.category === "WATER",
                    "bg-gray-400": row.category === "OTHER",
                  })} />
                  <span className="text-xs text-white/70">{row.category}</span>
                  <span className="text-xs font-semibold text-white">{row.count} reports</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded p-3 text-sm mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-ink/40">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            {t.loading}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const progressPct = Math.min(
                100,
                Math.round((project.current_votes / project.target_votes) * 100)
              );
              const isFunded = project.status === "FUNDED" || project.current_votes >= project.target_votes;
              const hasVoted = voted.has(project.id);
              const isVoting = votingId === project.id;

              return (
                <div
                  key={project.id}
                  className={cn(
                    "rounded-sm bg-white shadow-card border-t-4 flex flex-col",
                    isFunded ? "border-resolved" : "border-civic"
                  )}
                >
                  {/* Card header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={cn("text-xs px-2 py-0.5 rounded font-medium", categoryClass(project.category))}>
                        {project.category}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded font-medium",
                          isFunded
                            ? "bg-resolved/10 text-resolved border border-resolved/20"
                            : "bg-amber-civic/10 text-amber-dark border border-amber-civic/20"
                        )}
                      >
                        {isFunded ? t.projectFunded : STATUS_LABELS[project.status] || project.status}
                      </span>
                    </div>
                    <h3 className="font-slab text-base font-semibold text-ink leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-ink/60 mt-2 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Budget */}
                  <div className="px-4 mt-3 flex items-center gap-1.5 text-sm text-ink/60">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="font-semibold text-ink">{formatRupees(project.budget_allocated)}</span>
                    <span className="text-xs">allocated</span>
                  </div>

                  {/* Progress bar — Framer Motion only used here per spec §7 */}
                  <div className="px-4 mt-3">
                    <div className="flex justify-between text-xs text-ink/50 mb-1.5">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {project.current_votes} / {project.target_votes} {t.projectVotes}
                      </span>
                      <span className="font-semibold">{progressPct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-paper-dark overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          isFunded ? "bg-resolved" : "bg-amber-civic"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Vote button */}
                  <div className="p-4 mt-auto pt-4">
                    {isFunded ? (
                      <div className="flex items-center justify-center gap-2 rounded py-2.5 bg-resolved/10 text-resolved text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        {t.projectFunded}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVote(project.id)}
                        disabled={hasVoted || !!votingId}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-all",
                          hasVoted
                            ? "bg-paper-dark text-ink/40 cursor-default"
                            : "btn-primary"
                        )}
                      >
                        {isVoting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : hasVoted ? (
                          <CheckCircle2 className="h-4 w-4 text-resolved" />
                        ) : (
                          <Vote className="h-4 w-4" />
                        )}
                        {hasVoted ? "Voted!" : t.projectVote}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
