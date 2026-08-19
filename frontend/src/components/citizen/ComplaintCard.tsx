"use client";

import React, { useState } from "react";
import { MapPin, ThumbsUp, Calendar, CheckCircle2, XCircle, Clock, Image as ImageIcon } from "lucide-react";
import { GrievanceTicket, getCategoryIcon, ComplaintStatus } from "@/lib/grievance";
import { cn } from "@/lib/utils";

interface ComplaintCardProps {
  ticket: GrievanceTicket;
  onUpvote?: () => void;
  onVerifyResolution?: (action: "confirm" | "reopen", reason?: string) => void;
}

// ── Status Badge ─────────────────────────────────────────────────────────────

function TicketStatusBadge({ status }: { status: ComplaintStatus }) {
  const colorMap: Record<ComplaintStatus, string> = {
    NEW: "bg-sky-100 text-sky-800 border-sky-200",
    ASSIGNED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
    OVERDUE: "bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse",
    RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
    REOPENED: "bg-rose-100 text-rose-800 border-rose-200 font-bold",
  };

  return (
    <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase shrink-0", colorMap[status] || colorMap.NEW)}>
      {status}
    </span>
  );
}

// ── Resolution Verification Loop ─────────────────────────────────────────────

function ResolutionVerificationLoop({
  ticket,
  onVerify,
}: {
  ticket: GrievanceTicket;
  onVerify: (action: "confirm" | "reopen", reason?: string) => void;
}) {
  const [isReopening, setIsReopening] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  if (ticket.citizenVerification === "confirmed" || ticket.status === "CLOSED") {
    return (
      <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-2 text-emerald-800 bg-emerald-50/50 p-2.5 rounded-xl">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span className="text-[11px] font-extrabold">You confirmed this issue is resolved. Ticket closed!</span>
      </div>
    );
  }

  if (ticket.status === "REOPENED" || ticket.citizenVerification === "reopened") {
    return (
      <div className="mt-3 pt-3 border-t border-rose-200 flex items-center gap-2 text-rose-800 bg-rose-50 p-2.5 rounded-xl">
        <Clock className="h-4 w-4 text-rose-600 shrink-0" />
        <span className="text-[11px] font-extrabold">
          Reopened ({ticket.reopenedCount || 1}x) — Escalated to HIGH priority on Department Dashboard.
        </span>
      </div>
    );
  }

  if (ticket.status !== "RESOLVED" || ticket.citizenVerification !== "pending") {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-emerald-300 space-y-3">
      {/* Proof of Resolution Box */}
      {ticket.resolutionProof && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <p className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider">
              Proof of Resolution Uploaded by Officer
            </p>
          </div>

          <div className="flex items-start gap-3">
            {ticket.resolutionProof.photoUrl ? (
              <img
                src={ticket.resolutionProof.photoUrl}
                alt="Proof of work"
                className="h-16 w-16 object-cover rounded-lg border border-emerald-300 shrink-0 shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                <ImageIcon className="h-6 w-6 text-emerald-500" />
              </div>
            )}
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-slate-800 leading-snug">&quot;{ticket.resolutionProof.remarks}&quot;</p>
              <p className="text-[10px] text-slate-500 font-semibold">
                — {ticket.resolutionProof.officerName} • {new Date(ticket.resolutionProof.resolvedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Prominent Action Buttons */}
      {!isReopening ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onVerify("confirm")}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-extrabold px-3 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Fixed (Close Ticket)
          </button>
          <button
            type="button"
            onClick={() => setIsReopening(true)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-extrabold px-3 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
            Not Fixed (Reopen & Escalate)
          </button>
        </div>
      ) : (
        <div className="space-y-2 bg-rose-50 border border-rose-200 p-3 rounded-xl">
          <p className="text-xs font-bold text-rose-900">Why is this issue not resolved?</p>
          <textarea
            rows={2}
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Describe what remains broken or unaddressed…"
            className="w-full text-xs font-semibold border border-rose-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsReopening(false)}
              className="text-xs font-bold px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!reopenReason.trim()}
              onClick={() => {
                onVerify("reopen", reopenReason);
                setIsReopening(false);
              }}
              className="flex-1 text-xs font-extrabold px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Reopen & Flag High Priority
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Complaint Card ───────────────────────────────────────────────────────

export default function ComplaintCard({ ticket, onUpvote, onVerifyResolution }: ComplaintCardProps) {
  const accentColor: Record<ComplaintStatus, string> = {
    NEW: "border-l-sky-400",
    ASSIGNED: "border-l-indigo-400",
    IN_PROGRESS: "border-l-amber-400",
    OVERDUE: "border-l-red-500",
    RESOLVED: "border-l-emerald-500",
    CLOSED: "border-l-slate-400",
    REOPENED: "border-l-rose-500",
  };

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 border-l-4 rounded-2xl p-5 shadow-sm space-y-3 text-xs font-semibold text-slate-600 transition-all hover:shadow-md",
        accentColor[ticket.status] || "border-l-slate-300"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-400 text-[10px]">{ticket.id}</span>
          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
          <p className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1">
            <MapPin className="h-3 w-3 text-emerald-600" />
            {ticket.wardId}
          </p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
          {getCategoryIcon(ticket.departmentCode)} {ticket.title}
        </h3>
        <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">{ticket.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {ticket.departmentCode}
        </span>
        <button
          type="button"
          onClick={onUpvote}
          className="flex items-center gap-1 px-3 py-1 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-lg text-slate-600 hover:text-amber-800 font-bold text-[11px] transition-colors cursor-pointer"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{ticket.upvoteCount || 1}</span>
        </button>
      </div>

      {/* Resolution Verification Loop */}
      {onVerifyResolution && (
        <ResolutionVerificationLoop ticket={ticket} onVerify={onVerifyResolution} />
      )}
    </div>
  );
}
