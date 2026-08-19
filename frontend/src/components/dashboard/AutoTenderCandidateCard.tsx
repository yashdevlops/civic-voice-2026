"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, AlertTriangle, Layers, DollarSign } from "lucide-react";
import { AutoTenderCandidate } from "@/lib/types/advancedFeatures";
import { useAutoTenders } from "@/lib/autoTenderStore";

interface AutoTenderCandidateCardProps {
  candidate: AutoTenderCandidate;
}

export default function AutoTenderCandidateCard({ candidate }: AutoTenderCandidateCardProps) {
  const { approveAutoTender } = useAutoTenders();
  const [approving, setApproving] = useState(false);
  const [published, setPublished] = useState(candidate.status === "PUBLISHED_AS_TENDER");

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      approveAutoTender(candidate.id);
      setApproving(false);
      setPublished(true);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border-2 border-indigo-500/40 shadow-2xl space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
            AI COMPLAINT-TO-TENDER THRESHOLD ROLLUP RECOMMENDATION
          </span>
        </div>
        <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase">
          Ad-Hoc Patching Threshold Exceeded
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-white font-display">
          💡 {candidate.draftTenderTitle}
        </h3>
        <p className="text-xs text-amber-300 font-medium">
          Trigger Reason: {candidate.thresholdTriggerReason}
        </p>
        <p className="text-xs text-slate-300">
          Location: <strong>{candidate.streetName} ({candidate.wardId})</strong> • Total Micro-Maintenance Spent: <strong>₹{candidate.totalMaintenanceSpentInr.toLocaleString()}</strong>
        </p>
      </div>

      {published ? (
        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Capital Tender Published to E-Procurement Bidding Board! (₹{(candidate.suggestedTenderBudget / 100000).toFixed(2)} Lakhs)</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-300">
            Suggested Capital Budget: <strong className="text-emerald-400 font-mono text-sm">₹{(candidate.suggestedTenderBudget / 100000).toFixed(2)} Lakhs</strong>
          </div>
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {approving ? (
              <span>Publishing Tender to Bidding Board…</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Publish Capital Tender</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
