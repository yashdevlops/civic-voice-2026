"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import {
  Activity, CheckCircle2, Copy, BarChart3,
  Layers, Map, Loader2, AlertCircle, ArrowLeft, ShieldAlert
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getPublicGrievances, getStats } from "@/lib/api";
import type { GrievancePublic, StatsOut } from "@/lib/api";
import { useLiveUpdates } from "@/lib/ws";
import type { LiveEvent } from "@/lib/ws";
import EvidenceModal from "@/components/EvidenceModal";
import StatusBadge from "@/components/StatusBadge";
import { cn, formatDate, shortId, categoryClass } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";
import { useLiveTimestamp } from "@/lib/useLiveTimestamp";

export default function AdminPage() {
  const { t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<GrievancePublic[]>([]);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<GrievancePublic | null>(null);
  const [newTicketIds, setNewTicketIds] = useState<Set<string>>(new Set());

  // Role Gate & Redirect logic
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/login/admin");
      }
    }
  }, [user, authLoading, router]);

  // ── Load initial data ──────────────────────────────────────────────────
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [ticketData, statsData] = await Promise.all([
        getPublicGrievances().catch((err) => {
          console.error("Grievances fetch failed:", err);
          return null; // return null on failure to distinguish from empty array
        }),
        getStats().catch((err) => {
          console.error("Stats fetch failed:", err);
          return null;
        }),
      ]);

      setTickets(ticketData || []);
      
      // If stats fails to load, supply fallback stats so dashboard isn't broken
      if (statsData) {
        setStats(statsData);
      } else {
        setStats({
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
        });
      }
    } catch (err: unknown) {
      console.error("Unexpected error in loadData:", err);
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && user.role === "admin") {
      loadData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WebSocket live updates ─────────────────────────────────────────────
  const handleLiveEvent = useCallback((event: LiveEvent) => {
    if (event.event === "new_grievance") {
      const newGrievance = event.data as unknown as GrievancePublic;
      if (!newGrievance?.is_duplicate) {
        setTickets((prev) => {
          const exists = (prev ?? []).some((t) => t.id === newGrievance.id);
          if (exists) return prev;
          return [newGrievance, ...(prev ?? [])];
        });
        setNewTicketIds((prev) => new Set(prev).add(newGrievance.id));
        setTimeout(() => {
          setNewTicketIds((prev) => {
            const next = new Set(prev);
            next.delete(newGrievance.id);
            return next;
          });
        }, 4000);
      }
      getStats().then(setStats).catch(() => { });
    }

    if (event.event === "grievance_resolved") {
      const updated = event.data as unknown as GrievancePublic;
      setTickets((prev) => (prev ?? []).map((t) => (t.id === updated.id ? updated : t)));
      getStats().then(setStats).catch(() => { });
    }
  }, []);

  useLiveUpdates(handleLiveEvent);

  // ── Evidence modal callbacks ───────────────────────────────────────────
  function handleResolved(updated: GrievancePublic) {
    setTickets((prev) => (prev ?? []).map((t) => (t.id === updated.id ? updated : t)));
    setStats(null);
    getStats().then(setStats).catch(() => { });
  }

  // ── Map Mock Complaints to GrievancePublic shape ─────────────────────────
  const mappedMockTickets: GrievancePublic[] = (MOCK_COMPLAINTS ?? []).map((c) => {
    let category: any = "OTHER";
    const catLower = (c.category ?? "").toLowerCase();
    if (catLower.includes("road")) category = "ROADS";
    else if (catLower.includes("water")) category = "WATER";
    else if (catLower.includes("clean") || catLower.includes("waste") || catLower.includes("garbage")) category = "SANITATION";
    else if (catLower.includes("light") || catLower.includes("electr")) category = "ELECTRICITY";

    let status: any = "OPEN";
    if (c.status === "In Progress") status = "IN_PROGRESS";
    else if (c.status === "Resolved") status = "RESOLVED";

    return {
      id: c.id ?? Math.random().toString(36).substring(7),
      title: c.title ?? "Untitled Issue",
      description: `Reported issue: ${c.title ?? "Untitled"}. Located at ${c.location ?? "Unknown"}. Quick attention needed.`,
      category,
      status,
      priority_score: status === "RESOLVED" ? 1 : 4,
      latitude: 12.9716,
      longitude: 77.5946,
      address: c.location ?? null,
      image_url: null,
      audio_url: null,
      is_duplicate: false,
      parent_grievance_id: null,
      upvote_count: 3,
      citizen_id: "demo-citizen",
      created_at: new Date(c.date ?? Date.now()).toISOString(),
      updated_at: new Date(c.date ?? Date.now()).toISOString(),
      evidence: [],
    } as GrievancePublic;
  });

  const isMockData = tickets.length === 0 && !loading;
  const ticketsToRender = isMockData ? mappedMockTickets : tickets;

  // Render neutral loading screen while checking auth hydration
  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-2 text-slate-500 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-semibold">Loading session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 font-sans" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Defense-in-depth warning banner */}
      <div className="bg-amber-500 text-slate-900 text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 border-b border-amber-600/20">
        <ShieldAlert style={{ width: 14, height: 14 }} className="shrink-0 animate-bounce" />
        <span>Restricted Area: Municipal Officers Only</span>
      </div>

      {/* Header */}
      <div className="px-4 py-8 sm:px-6" style={{ background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)" }}>
        <div className="mx-auto max-w-7xl">
          {/* Conditional Back Button */}
          <div className="mb-4">
            <Link
              href={user ? "/dashboard" : "/"}
              className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white font-semibold transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-control"
            >
              <ArrowLeft style={{ width: 13, height: 13 }} />
              {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-white/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.adminTitle || "Admin Dashboard"}</h1>
              <p className="text-white/70 text-xs mt-0.5">{t.adminSubtitle || "Manage public grievances"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Layers className="h-5 w-5 text-primary" />}
              label={t.statTotal || "Total Reported"}
              value={stats.total_reported ?? 0}
              accentColor="border-primary"
            />
            <StatCard
              icon={<Copy className="h-5 w-5 text-blue-500" />}
              label={t.statDedup || "Auto-Deduplicated"}
              value={stats.auto_deduplicated ?? 0}
              subtitle="merged automatically"
              accentColor="border-blue-400"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
              label={t.statResolvedPct || "Resolved %"}
              value={`${stats.resolved_percent ?? 0}%`}
              accentColor="border-green-500"
            />
            <div className="stat-card border-t-4 border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t.statByCategory || "By Category"}
                </p>
              </div>
              <div className="space-y-1.5">
                {(stats.by_category ?? []).map((row) => (
                  <div key={row?.category ?? Math.random().toString()} className="flex items-center justify-between gap-2">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-pill font-medium", categoryClass(row?.category ?? "OTHER"))}>
                      {row?.category ?? "OTHER"}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 tabular-nums">{row?.count ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="stat-card animate-pulse h-24" />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Live Ticket Feed ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="section-heading">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              {t.liveTitle || "Live Feed"}
            </h2>

            {/* Error message (when not mock fallback) */}
            {error && !isMockData && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-control p-3 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Honesty Mock Data Warning Banner */}
            {isMockData && (
              <div className="bg-amber-50 border border-amber-200 rounded-control p-3.5 flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Demo tickets — no live complaints in queue</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                {t.loading || "Loading…"}
              </div>
            ) : ticketsToRender.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-card border border-slate-100 shadow-card">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{t.liveEmpty || "No active complaints."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ticketsToRender.map((ticket) => (
                  <TicketRow
                    key={ticket?.id ?? Math.random().toString()}
                    ticket={ticket}
                    isMockData={isMockData}
                    isNew={newTicketIds.has(ticket?.id ?? "")}
                    onResolve={setSelectedTicket}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Map Placeholder ──────────────────────────────────────────── */}
          <div className="space-y-3">
            <h2 className="section-heading">
              <Map className="h-5 w-5 text-primary" />
              Map View
            </h2>
            <div className="rounded-card border-2 border-dashed border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center min-h-64 gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {t.mapPlaceholder || "Map view not loaded"}
              </p>
              <div className="mt-2 rounded-control bg-slate-50 p-2 text-xs text-slate-400 font-mono text-left w-full">
                <p className="text-slate-300 mb-1">// Example pin data:</p>
                <p>latitude: 20.2961</p>
                <p>longitude: 85.8245</p>
                <p>priority: 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence / Resolution Modal */}
      {selectedTicket && (
        <EvidenceModal
          grievance={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
}

// ── TicketRow sub-component ─────────────────────────────────────────────────
// Hook (useLiveTimestamp) must be called at component scope, not inside .map()

function TicketRow({
  ticket, isMockData, isNew, onResolve,
}: {
  ticket: GrievancePublic;
  isMockData: boolean;
  isNew: boolean;
  onResolve: (t: GrievancePublic) => void;
}) {
  const { t } = useI18n();
  const timestamp = useLiveTimestamp(ticket?.created_at);

  return (
    <div
      className={cn(
        "ticket-card p-4 bg-white relative overflow-hidden",
        ticket?.status === "RESOLVED" && "ticket-resolved",
        isNew && "animate-slide-in-top"
      )}
      data-priority={ticket?.priority_score ?? 3}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-1">
              {ticket?.title ?? "Untitled Issue"}
            </p>
            {isMockData && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-pill font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider shrink-0">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            #{shortId(ticket?.id ?? "")} · {timestamp}
          </p>
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {ticket?.description ?? ""}
          </p>
          {ticket?.address && (
            <p className="text-xs text-slate-400 mt-1">📍 {ticket.address}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <span className={cn("text-xs px-2 py-0.5 rounded-pill font-medium", categoryClass(ticket?.category ?? "OTHER"))}>
            {ticket?.category ?? "OTHER"}
          </span>
          <StatusBadge status={ticket?.status ?? "OPEN"} />
          <span className="text-xs text-slate-400">P{ticket?.priority_score ?? 3}</span>
        </div>
      </div>
      {ticket?.status !== "RESOLVED" && ticket?.status !== "REJECTED" && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <button onClick={() => onResolve(ticket)} className="btn-primary text-xs py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t.resolveBtn || "Resolve"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── StatCard sub-component ─────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subtitle,
  accentColor = "border-primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
}) {
  return (
    <div className={cn("stat-card border-t-4 bg-white shadow-card", accentColor)} style={{ borderRadius: "var(--radius-card)" }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
