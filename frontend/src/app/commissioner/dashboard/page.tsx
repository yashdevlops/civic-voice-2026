"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe, AlertTriangle, ShieldCheck, CheckCircle2, Zap,
  TrendingUp, BarChart3, Map, Activity, Clock, LogOut,
  ArrowRight, Building2, Flame
} from "lucide-react";
import {
  getComputedTickets,
  detectCrossWardClusters,
  GRIEVANCE_SYNC_EVENT,
  seedGrievancesIfEmpty,
} from "@/lib/grievanceStore";
import { GrievanceTicket, DistrictClusterAlert, MUNICIPAL_DEPARTMENTS, MunicipalDeptCode } from "@/lib/grievance";
import { getCommissionerSession, clearCommissionerSession, AuthUser } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import GovtTenderBanner from "@/components/dashboard/GovtTenderBanner";
import AutoTenderCandidateCard from "@/components/dashboard/AutoTenderCandidateCard";
import { useAutoTenders } from "@/lib/autoTenderStore";
import BroadcastEmergencyModal from "@/components/dashboard/BroadcastEmergencyModal";

// ── Cluster Alert Banner ───────────────────────────────────────────────────────

function DistrictClusterAlertBanner({
  alerts,
  onOpenBroadcast,
}: {
  alerts: DistrictClusterAlert[];
  onOpenBroadcast: () => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-5 text-white flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-emerald-300">
            ✅ City Infrastructure Systems Normal
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            No multi-ward systemic anomalies or cross-district infrastructure failures detected across Bhubaneswar&apos;s 67 wards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-2xl border-2 border-red-500 bg-red-950/60 p-6 text-white shadow-2xl shadow-red-500/20 animate-pulse space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white font-extrabold shadow-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                  ⚠️ DISTRICT-LEVEL CLUSTER ALERT
                </span>
                <h2 className="text-lg font-extrabold text-white mt-1 leading-tight">
                  SYSTEMIC FAILURE DETECTED: {alert.categoryLabel}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenBroadcast}
                className="px-3.5 py-2 text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer animate-bounce"
              >
                <AlertTriangle className="h-4 w-4" />
                🚨 Broadcast Ward Emergency
              </button>

              <button
                type="button"
                onClick={() => alert && window.alert(`Inter-Department Command Sent for ${alert.affectedWards.join(", ")}. Field superintendents notified.`)}
                className="px-3.5 py-2 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="h-4 w-4" />
                Coordinate Inter-Department Action
              </button>
              <button
                type="button"
                onClick={() => window.alert("Formal Escalation Briefing dispatched to Odisha State Urban Development Department.")}
                className="px-3.5 py-2 text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                Escalate to State Urban Development
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 font-bold uppercase tracking-wider text-[10px]">Affected Ward Span ({alert.affectedWards.length} Wards):</p>
              <p className="text-white font-extrabold mt-0.5 text-sm">{alert.affectedWards.join(" • ")}</p>
            </div>

            <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 font-bold uppercase tracking-wider text-[10px]">Unresolved Incident Volume:</p>
              <p className="text-white font-extrabold mt-0.5 text-sm">{alert.unresolvedCount} Active Complaints</p>
            </div>

            <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 font-bold uppercase tracking-wider text-[10px]">Impacted Citizen Footprint:</p>
              <p className="text-white font-extrabold mt-0.5 text-sm">~{alert.citizensAffected} Citizens Impacted</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function CommissionerDashboard() {
  const router = useRouter();
  const { candidates } = useAutoTenders();

  const [session, setSession] = useState<AuthUser | null>(null);
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
  const [alerts, setAlerts] = useState<DistrictClusterAlert[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  useEffect(() => {
    seedGrievancesIfEmpty();
    const curr = getCommissionerSession();
    if (!curr) {
      router.push("/commissioner/login");
      return;
    }
    setSession(curr);
  }, [router]);

  const loadData = useCallback(() => {
    const all = getComputedTickets();
    setTickets(all);
    setAlerts(detectCrossWardClusters());
  }, []);

  useEffect(() => {
    loadData();
    const h = () => loadData();
    window.addEventListener(GRIEVANCE_SYNC_EVENT, h);
    return () => window.removeEventListener(GRIEVANCE_SYNC_EVENT, h);
  }, [loadData]);

  const handleLogout = () => {
    clearCommissionerSession();
    router.push("/commissioner/login");
  };

  // Metrics
  const totalLogged = tickets.length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length;
  const overdueCount = tickets.filter((t) => t.status === "OVERDUE").length;
  const overdueRate = totalLogged > 0 ? Math.round((overdueCount / totalLogged) * 100) : 0;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
  const resolutionVelocity = totalLogged > 0 ? Math.round((resolvedCount / totalLogged) * 100) : 0;

  // 6-Department Matrix
  const deptMatrix = Object.values(MUNICIPAL_DEPARTMENTS).map((d) => {
    const deptTickets = tickets.filter((t) => t.departmentCode === d.code);
    const active = deptTickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length;
    const overdue = deptTickets.filter((t) => t.status === "OVERDUE").length;
    const metSla = deptTickets.length - overdue;
    const slaCompliance = deptTickets.length > 0 ? Math.round((metSla / deptTickets.length) * 100) : 100;
    const avgVelocity = deptTickets.length > 0 ? `${(d.defaultSlaHours / 12).toFixed(1)}h avg` : "—";

    return {
      dept: d,
      total: deptTickets.length,
      active,
      overdue,
      slaCompliance,
      avgVelocity,
    };
  });

  // Ward Hotspots
  const wardCountMap: Record<string, number> = {};
  tickets.forEach((t) => {
    if (t.status !== "RESOLVED" && t.status !== "CLOSED") {
      wardCountMap[t.wardId] = (wardCountMap[t.wardId] || 0) + 1;
    }
  });

  const wardHotspots = Object.entries(wardCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-950 text-slate-100">
      {/* Executive Command Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Globe className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {session?.name || "Municipal Commissioner"}
              </h1>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                COMMISSIONER CLEARANCE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Bhubaneswar Municipal Corporation (BMC) • All 67 Wards • 6 Core Departments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold transition-all shadow-md shadow-red-600/30 cursor-pointer animate-pulse"
            >
              <AlertTriangle className="h-4 w-4 text-white" />
              <span>🚨 Broadcast Ward Emergency</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout Suite
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
        {/* Quick-Access E-Procurement Banner */}
        <GovtTenderBanner />

        {/* AI Complaint-to-Tender Rollup Candidates */}
        {candidates.map((cand) => (
          <AutoTenderCandidateCard key={cand.id} candidate={cand} />
        ))}

        {/* Standout Feature: Multi-Ward Cluster Alert Banner */}
        <DistrictClusterAlertBanner
          alerts={alerts}
          onOpenBroadcast={() => setShowBroadcastModal(true)}
        />

        {/* Global Executive Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1 shadow-lg">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Logged Complaints</p>
            <p className="text-3xl font-extrabold text-white">{totalLogged}</p>
            <p className="text-[10px] text-emerald-400 font-bold">Across 67 BMC Wards</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1 shadow-lg">
            <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Active In-Progress</p>
            <p className="text-3xl font-extrabold text-amber-400">{inProgress}</p>
            <p className="text-[10px] text-slate-400 font-bold">Field Crews Assigned</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1 shadow-lg">
            <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest">Overdue Breach Rate</p>
            <p className="text-3xl font-extrabold text-red-400">{overdueRate}%</p>
            <p className="text-[10px] text-red-300 font-bold">{overdueCount} tickets breached SLA</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1 shadow-lg">
            <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Resolution Velocity</p>
            <p className="text-3xl font-extrabold text-emerald-400">{resolutionVelocity}%</p>
            <p className="text-[10px] text-slate-400 font-bold">{resolvedCount} tickets closed/resolved</p>
          </div>
        </div>

        {/* 6-Department Performance Scorecards Matrix */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-white font-display">
                6-Department Performance Matrix
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Click any row to drill down into Department Queue →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Department</th>
                  <th className="p-3">Active Queue</th>
                  <th className="p-3">SLA Breach</th>
                  <th className="p-3">SLA Compliance Rate</th>
                  <th className="p-3">Avg Resolution Velocity</th>
                  <th className="p-3 text-right">Drill-Down Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {deptMatrix.map((row) => (
                  <tr
                    key={row.dept.code}
                    onClick={() => router.push(`/municipal/dashboard?dept=${row.dept.code}`)}
                    className="hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-extrabold flex items-center gap-2 text-white">
                      <span>{row.dept.icon}</span>
                      <span>{row.dept.name}</span>
                    </td>
                    <td className="p-3 font-bold text-amber-300">{row.active} open</td>
                    <td className="p-3 font-bold text-red-400">{row.overdue} overdue</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              row.slaCompliance >= 80 ? "bg-emerald-500" : row.slaCompliance >= 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${row.slaCompliance}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-white text-xs">{row.slaCompliance}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{row.avgVelocity}</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300">
                        View Queue <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ward Hotspots Density */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-red-400">
            <Flame className="h-5 w-5" />
            <h2 className="text-base font-extrabold text-white font-display">
              Ward Hotspots Ranking (Highest Unresolved Density)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {wardHotspots.map(([wardId, count], rank) => (
              <div key={wardId} className="rounded-xl bg-slate-800/80 border border-slate-700 p-4 space-y-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Rank #{rank + 1}</span>
                <p className="font-extrabold text-white text-sm">{wardId}</p>
                <p className="text-xs font-bold text-red-400">{count} Unresolved Issues</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast Emergency Modal */}
      <BroadcastEmergencyModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </div>
  );
}
