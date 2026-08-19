"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2, UserCheck, Clock, CheckCircle2, AlertTriangle,
  Play, Plus, ThumbsUp, MapPin, Image as ImageIcon,
  Loader2, LogOut, ArrowLeft, Filter, ShieldCheck, Camera, Bot
} from "lucide-react";
import {
  GrievanceTicket,
  ComplaintStatus,
  MunicipalDeptCode,
  MUNICIPAL_DEPARTMENTS,
  getCategoryIcon,
} from "@/lib/grievance";
import {
  getComputedTickets,
  assignOfficer,
  updateStatus,
  addResolutionProof,
  GRIEVANCE_SYNC_EVENT,
  seedGrievancesIfEmpty,
} from "@/lib/grievanceStore";
import { getMunicipalSession, clearMunicipalSession, AuthUser } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import AssignFieldTeamModal from "@/components/dashboard/AssignFieldTeamModal";
import GovtTenderBanner from "@/components/dashboard/GovtTenderBanner";
import AiBoqEstimatorModal from "@/components/dashboard/AiBoqEstimatorModal";

// ── Pipeline Stages ───────────────────────────────────────────────────────────

const PIPELINE_TABS: { key: string; label: string; filterStatus?: ComplaintStatus }[] = [
  { key: "ALL", label: "ALL" },
  { key: "NEW", label: "NEW", filterStatus: "NEW" },
  { key: "ASSIGNED", label: "ASSIGNED", filterStatus: "ASSIGNED" },
  { key: "IN_PROGRESS", label: "IN PROGRESS", filterStatus: "IN_PROGRESS" },
  { key: "OVERDUE", label: "OVERDUE 🚨", filterStatus: "OVERDUE" },
  { key: "RESOLVED", label: "RESOLVED", filterStatus: "RESOLVED" },
];

// ── SLA Countdown Chip ────────────────────────────────────────────────────────

function SlaCountdownChip({ deadlineIso, status }: { deadlineIso: string; status: ComplaintStatus }) {
  if (status === "RESOLVED" || status === "CLOSED") {
    return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✅ Met SLA</span>;
  }

  const deadline = new Date(deadlineIso).getTime();
  const now = Date.now();
  const diffMs = deadline - now;

  if (diffMs <= 0 || status === "OVERDUE") {
    const overdueHours = Math.abs(Math.round(diffMs / 3600000));
    return (
      <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300 animate-pulse flex items-center gap-1">
        🚨 OVERDUE ({overdueHours}h)
      </span>
    );
  }

  const hoursLeft = Math.round(diffMs / 3600000);
  const isUrgent = hoursLeft < 12;

  return (
    <span className={cn(
      "text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1",
      isUrgent ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-emerald-50 text-emerald-800 border-emerald-200"
    )}>
      <Clock className="h-3 w-3" />
      ⏱ {hoursLeft}h left
    </span>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ComplaintStatus }) {
  const badgeStyles: Record<ComplaintStatus, string> = {
    NEW: "bg-sky-100 text-sky-800 border-sky-200",
    ASSIGNED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
    OVERDUE: "bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse",
    RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
    REOPENED: "bg-rose-100 text-rose-800 border-rose-200 font-bold",
  };

  return (
    <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded border tracking-wide uppercase", badgeStyles[status] || badgeStyles.NEW)}>
      {status}
    </span>
  );
}

// ── Priority Badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const styleMap: Record<string, string> = {
    CRITICAL: "bg-red-600 text-white font-extrabold",
    HIGH: "bg-orange-500 text-white font-bold",
    MEDIUM: "bg-amber-100 text-amber-900 font-bold border border-amber-300",
    LOW: "bg-slate-100 text-slate-700 font-medium border border-slate-200",
  };
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider", styleMap[priority] || styleMap.MEDIUM)}>
      {priority}
    </span>
  );
}



// ── Proof of Work Modal ───────────────────────────────────────────────────────

function ResolutionProofModal({
  ticket,
  officerName,
  onClose,
  onResolved,
}: {
  ticket: GrievanceTicket;
  officerName: string;
  onClose: () => void;
  onResolved: () => void;
}) {
  const [remarks, setRemarks] = useState("");
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60"
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    addResolutionProof(ticket.id, {
      photoUrl,
      remarks: remarks.trim(),
      officerName,
    });
    setSaving(false);
    onResolved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 font-sans text-slate-800">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <Camera className="h-5 w-5 text-emerald-600" />
            <h3 className="font-extrabold text-base">Mandatory Proof of Work — {ticket.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
          <p className="font-bold text-emerald-900">{ticket.title}</p>
          <p className="text-emerald-700">{ticket.addressText} ({ticket.wardId})</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 uppercase tracking-wider mb-1">Resolution Remarks *</label>
            <textarea
              rows={3}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe repairs undertaken (e.g., 'Replaced 40W LED fixture and inspected main line wire')"
              className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 uppercase tracking-wider mb-1">After-Repair Photo URL *</label>
            <input
              type="text"
              required
              className="civic-input mb-2"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            {photoUrl && (
              <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                <img src={photoUrl} alt="Proof preview" className="h-16 w-16 object-cover rounded-lg border shrink-0" />
                <p className="text-[10px] text-emerald-700 font-bold">✓ After-Repair Photo Ready</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-xs justify-center py-2.5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !remarks.trim()}
              className="flex-1 btn-primary text-xs justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Proof & Resolve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page Content ───────────────────────────────────────────────────────

function UnifiedMunicipalDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<AuthUser | null>(null);
  const [activeDeptCode, setActiveDeptCode] = useState<MunicipalDeptCode>("roads_potholes");
  const [activePipelineTab, setActivePipelineTab] = useState<string>("ALL");
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assigningTicket, setAssigningTicket] = useState<GrievanceTicket | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<GrievanceTicket | null>(null);
  const [boqTicket, setBoqTicket] = useState<GrievanceTicket | null>(null);

  // Load session
  useEffect(() => {
    seedGrievancesIfEmpty();
    const curr = getMunicipalSession();
    if (!curr) {
      router.push("/municipal/login");
      return;
    }
    setSession(curr);

    // If query parameter specifies dept, respect it (drill-down from Commissioner)
    const deptParam = searchParams.get("dept") as MunicipalDeptCode;
    if (deptParam && deptParam in MUNICIPAL_DEPARTMENTS) {
      setActiveDeptCode(deptParam);
    } else if (curr.departmentCode) {
      setActiveDeptCode(curr.departmentCode);
    }
  }, [router, searchParams]);

  const loadData = useCallback(() => {
    setLoading(true);
    setTickets(getComputedTickets());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const h = () => loadData();
    window.addEventListener(GRIEVANCE_SYNC_EVENT, h);
    return () => window.removeEventListener(GRIEVANCE_SYNC_EVENT, h);
  }, [loadData]);

  const handleLogout = () => {
    clearMunicipalSession();
    router.push("/municipal/login");
  };

  // Filter queue by active department & active pipeline tab
  const deptTickets = tickets.filter((t) => t.departmentCode === activeDeptCode);

  const filteredTickets = deptTickets.filter((t) => {
    if (activePipelineTab === "ALL") return true;
    const tabObj = PIPELINE_TABS.find((p) => p.key === activePipelineTab);
    return tabObj?.filterStatus ? t.status === tabObj.filterStatus : true;
  });

  const activeDeptMeta = MUNICIPAL_DEPARTMENTS[activeDeptCode];

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-50">
      {/* Top Officer Context Header */}
      <div className="bg-slate-900 text-white px-4 py-6 sm:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Building2 className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-extrabold tracking-tight">
                Welcome, {session?.name || "Officer"}
              </h1>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {session?.officialId || "BMC-OFFICER"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              BMC Department of <strong className="text-emerald-400">{activeDeptMeta?.name}</strong> • {session?.designation || "Officer"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout Session
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-6">
        {/* Quick-Access E-Procurement Banner */}
        <GovtTenderBanner />

        {/* Quick-Switch Tag Bar for 6 Core Departments */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Select Municipal Department Queue:</span>
            <span className="text-emerald-700 font-extrabold">Active: {activeDeptMeta?.name}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Object.values(MUNICIPAL_DEPARTMENTS).map((d) => {
              const count = tickets.filter((t) => t.departmentCode === d.code && t.status !== "RESOLVED" && t.status !== "CLOSED").length;
              const isSelected = activeDeptCode === d.code;
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => setActiveDeptCode(d.code)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <span className="text-base">{d.icon}</span>
                  <p className="text-[11px] font-bold mt-1 line-clamp-1">{d.name.split(" ")[0]}</p>
                  <span className={cn("text-[9px] font-extrabold mt-1 px-1.5 py-0.2 rounded-full w-fit", isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700")}>
                    {count} open
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Pipeline Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {PIPELINE_TABS.map((tab) => {
              const tabCount = tab.key === "ALL"
                ? deptTickets.length
                : deptTickets.filter((t) => t.status === tab.filterStatus).length;
              const isActive = activePipelineTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActivePipelineTab(tab.key)}
                  className={cn(
                    "px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-bold", isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700")}>
                    {tabCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ticket Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <span>Loading department tickets…</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="h-10 w-10 mx-auto opacity-30 text-emerald-600" />
              <p className="text-sm font-bold text-slate-700">No tickets in this stage.</p>
              <p className="text-xs text-slate-400">Select another pipeline tab or municipal department.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Ticket ID & Citizen Info</th>
                    <th className="p-4">Issue & Media</th>
                    <th className="p-4">Priority & Votes</th>
                    <th className="p-4">SLA Countdown</th>
                    <th className="p-4">Assigned Crew</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ticket ID & Citizen */}
                      <td className="p-4 align-top space-y-1">
                        <span className="font-mono font-bold text-slate-900 text-xs">{ticket.id}</span>
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-800">{ticket.citizenName}</p>
                          <p className="text-[10px] text-slate-500">{ticket.citizenPhone}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <MapPin className="h-2.5 w-2.5" />
                          {ticket.wardId}
                        </span>
                      </td>

                      {/* Issue & Media */}
                      <td className="p-4 align-top max-w-xs space-y-1">
                        <p className="font-extrabold text-slate-900 leading-snug">
                          {getCategoryIcon(ticket.departmentCode)} {ticket.title}
                        </p>
                        <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{ticket.description}</p>
                        <p className="text-[10px] text-slate-400 italic">{ticket.addressText}</p>
                        {ticket.mediaUrls && ticket.mediaUrls.length > 0 && (
                          <div className="flex gap-1 pt-1">
                            {ticket.mediaUrls.map((url, i) => (
                              <img key={i} src={url} alt="Media" className="h-10 w-10 object-cover rounded-lg border" />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Priority & Votes */}
                      <td className="p-4 align-top space-y-2">
                        <PriorityBadge priority={ticket.priority} />
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{ticket.upvoteCount} votes</span>
                        </div>
                      </td>

                      {/* SLA Countdown */}
                      <td className="p-4 align-top">
                        <SlaCountdownChip deadlineIso={ticket.slaDeadlineAt} status={ticket.status} />
                      </td>

                      {/* Assigned Crew */}
                      <td className="p-4 align-top text-xs">
                        {ticket.assignedOfficerName ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{ticket.assignedOfficerName}</p>
                            <p className="text-[10px] text-slate-500">{ticket.assignedOfficerRole || "Field Crew"}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 align-top space-y-1">
                        <StatusBadge status={ticket.status} />
                        {ticket.citizenVerification && (
                          <p className="text-[9px] font-bold text-slate-500">
                            Verification: <span className="underline">{ticket.citizenVerification}</span>
                          </p>
                        )}
                      </td>

                      {/* Operational Actions */}
                      <td className="p-4 align-top text-right space-y-1.5">
                        <div className="flex flex-col items-end gap-1.5">
                          {/* Assign Team */}
                          <button
                            onClick={() => setAssigningTicket(ticket)}
                            className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            {ticket.assignedOfficerName ? "Reassign" : "Assign Team"}
                          </button>

                          {/* Start Progress */}
                          {(ticket.status === "ASSIGNED" || ticket.status === "NEW") && (
                            <button
                              onClick={() => updateStatus(ticket.id, "IN_PROGRESS")}
                              className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start Progress
                            </button>
                          )}

                          {/* AI BOQ Estimator */}
                          <button
                            onClick={() => setBoqTicket(ticket)}
                            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                            title="Run AI Computer Vision & BOQ Material Estimator"
                          >
                            <Bot className="h-3.5 w-3.5 text-emerald-600" />
                            <span>AI BOQ</span>
                          </button>

                          {/* Resolve Issue */}
                          {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                            <button
                              onClick={() => setResolvingTicket(ticket)}
                              className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Resolve Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assigningTicket && (
        <AssignFieldTeamModal
          ticket={assigningTicket}
          isOpen={!!assigningTicket}
          onClose={() => setAssigningTicket(null)}
          onConfirmAssignment={(ticketId, name, role) => {
            assignOfficer(ticketId, name, role);
            loadData();
          }}
        />
      )}

      {/* Proof of Work Modal */}
      {resolvingTicket && session && (
        <ResolutionProofModal
          ticket={resolvingTicket}
          officerName={session.name}
          onClose={() => setResolvingTicket(null)}
          onResolved={loadData}
        />
      )}

      {/* AI BOQ Estimator Modal */}
      {boqTicket && (
        <AiBoqEstimatorModal
          ticket={boqTicket}
          isOpen={!!boqTicket}
          onClose={() => setBoqTicket(null)}
        />
      )}
    </div>
  );
}

export default function UnifiedMunicipalDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-sans">Loading Municipal Dashboard…</div>}>
      <UnifiedMunicipalDashboardContent />
    </Suspense>
  );
}
