export const dynamic = 'force-dynamic';
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, CheckCircle2, Copy, BarChart3,
  Layers, Map, Loader2, AlertCircle
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getPublicGrievances, getStats } from "@/lib/api";
import type { GrievancePublic, StatsOut } from "@/lib/api";
import { useLiveUpdates } from "@/lib/ws";
import type { LiveEvent } from "@/lib/ws";
import EvidenceModal from "@/components/EvidenceModal";
import { cn, formatDate, shortId, categoryClass, statusClass } from "@/lib/utils";

export default function AdminPage() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<GrievancePublic[]>([]);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<GrievancePublic | null>(null);
  const [newTicketIds, setNewTicketIds] = useState<Set<string>>(new Set());

  // ── Load initial data ──────────────────────────────────────────────────
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [ticketData, statsData] = await Promise.all([
        getPublicGrievances(),
        getStats(),
      ]);
      setTickets(ticketData);
      setStats(statsData);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WebSocket live updates ─────────────────────────────────────────────
  const handleLiveEvent = useCallback((event: LiveEvent) => {
    if (event.event === "new_grievance") {
      const newGrievance = event.data as unknown as GrievancePublic;
      if (!newGrievance.is_duplicate) {
        setTickets((prev) => {
          // Prepend; avoid duplicates if event arrives twice
          const exists = prev.some((t) => t.id === newGrievance.id);
          if (exists) return prev;
          return [newGrievance, ...prev];
        });
        // Mark as "new" for the slide-in animation
        setNewTicketIds((prev) => new Set(prev).add(newGrievance.id));
        setTimeout(() => {
          setNewTicketIds((prev) => {
            const next = new Set(prev);
            next.delete(newGrievance.id);
            return next;
          });
        }, 4000);
      }
      // Refresh stats on any new submission
      getStats().then(setStats).catch(() => { });
    }

    if (event.event === "grievance_resolved") {
      const updated = event.data as unknown as GrievancePublic;
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      getStats().then(setStats).catch(() => { });
    }
  }, []);

  useLiveUpdates(handleLiveEvent);

  // ── Evidence modal callbacks ───────────────────────────────────────────
  function handleResolved(updated: GrievancePublic) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setStats(null); // Trigger re-fetch
    getStats().then(setStats).catch(() => { });
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-ink text-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-civic">
              <Activity className="h-5 w-5 text-ink" />
            </div>
            <div>
              <h1 className="font-slab text-2xl font-semibold">{t.adminTitle}</h1>
              <p className="text-white/50 text-xs mt-0.5">{t.adminSubtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Layers className="h-5 w-5 text-civic" />}
              label={t.statTotal}
              value={stats.total_reported}
              color="border-civic"
            />
            <StatCard
              icon={<Copy className="h-5 w-5 text-amber-civic" />}
              label={t.statDedup}
              value={stats.auto_deduplicated}
              subtitle="merged automatically"
              color="border-amber-civic"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-resolved" />}
              label={t.statResolvedPct}
              value={`${stats.resolved_percent}%`}
              color="border-resolved"
            />
            <div className="stat-card border-ink/20 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-ink/50" />
                <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                  {t.statByCategory}
                </p>
              </div>
              <div className="space-y-1.5">
                {stats.by_category.map((row) => (
                  <div key={row.category} className="flex items-center justify-between gap-2">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", categoryClass(row.category))}>
                      {row.category}
                    </span>
                    <span className="text-sm font-semibold text-ink tabular-nums">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="stat-card animate-pulse bg-white h-24" />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Live Ticket Feed ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="section-heading">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-civic opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-dark" />
              </span>
              {t.liveTitle}
            </h2>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded p-3 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 text-ink/40">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                {t.loading}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-ink/40">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{t.liveEmpty}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={cn(
                      "ticket-card p-4",
                      ticket.status === "RESOLVED" && "ticket-resolved",
                      newTicketIds.has(ticket.id) && "animate-slide-in-top"
                    )}
                    data-priority={ticket.priority_score}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-slab text-sm font-semibold text-ink leading-snug line-clamp-1">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-ink/50 mt-0.5">
                          #{shortId(ticket.id)} · {formatDate(ticket.created_at)}
                        </p>
                        <p className="text-xs text-ink/70 mt-1.5 line-clamp-2 leading-relaxed">
                          {ticket.description}
                        </p>
                        {ticket.address && (
                          <p className="text-xs text-ink/40 mt-1">📍 {ticket.address}</p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", categoryClass(ticket.category))}>
                          {ticket.category}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", statusClass(ticket.status))}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-ink/40">P{ticket.priority_score}</span>
                      </div>
                    </div>
                    {ticket.status !== "RESOLVED" && ticket.status !== "REJECTED" && (
                      <div className="mt-3 pt-3 border-t border-paper-dark flex justify-end">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="btn-primary text-xs py-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t.resolveBtn}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Map Placeholder ──────────────────────────────────────────── */}
          <div className="space-y-3">
            <h2 className="section-heading">
              <Map className="h-5 w-5" />
              Map View
            </h2>
            <div className="rounded-sm border-2 border-dashed border-paper-dark bg-white p-6 flex flex-col items-center justify-center text-center min-h-64 gap-3">
              <Map className="h-10 w-10 text-ink/20" />
              <p className="text-sm text-ink/50 leading-relaxed max-w-xs">
                {t.mapPlaceholder}
              </p>
              <div className="mt-2 rounded bg-paper p-2 text-xs text-ink/40 font-mono text-left w-full">
                <p className="text-ink/30 mb-1">// Example pin data:</p>
                <p>latitude: 20.2961</p>
                <p>longitude: 85.8245</p>
                <p>priority: 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence / Resolution Modal */}
      <EvidenceModal
        grievance={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onResolved={handleResolved}
      />
    </div>
  );
}

// ── StatCard sub-component ─────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color = "border-civic",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className={cn("stat-card", color.replace("border-", "border-t-"))}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">{label}</p>
      </div>
      <p className="font-slab text-2xl font-bold text-ink">{value}</p>
      {subtitle && <p className="text-xs text-ink/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}
