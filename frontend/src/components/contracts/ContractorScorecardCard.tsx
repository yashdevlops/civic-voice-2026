"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Star, CheckCircle2, Award, Clock, FileText } from "lucide-react";
import { ContractorScorecard } from "@/lib/types/advancedFeatures";

interface ContractorScorecardCardProps {
  contractor: ContractorScorecard;
}

export default function ContractorScorecardCard({ contractor }: ContractorScorecardCardProps) {
  const isClean = contractor.blacklistStatus === "ACTIVE_CLEAN";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              {contractor.companyName}
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {contractor.licenseClass.replace("_", " ")}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Empanelled Municipal Works Contractor • {contractor.awardedTendersCount} Tenders Awarded
          </p>
        </div>

        {isClean ? (
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            🛡️ Clean Record (Empanelled)
          </span>
        ) : (
          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            ⚠️ Under Probation
          </span>
        )}
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">On-Time Delivery</span>
          <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
            {contractor.onTimeCompletionRate}%
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Rating</span>
          <p className="text-base font-extrabold text-amber-500 font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {contractor.citizenQualityRating}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">6-Mo Defect Rate</span>
          <p className={`text-base font-extrabold font-mono mt-0.5 ${contractor.reopenDefectRate > 10 ? "text-red-600" : "text-emerald-600"}`}>
            {contractor.reopenDefectRate}%
          </p>
        </div>
      </div>

      {/* Completed Projects & Defect Liability Warranties */}
      <div className="space-y-1.5 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Municipal Projects & Warranty Status:</span>
        <div className="space-y-1">
          {contractor.completedProjects.map((p, idx) => (
            <div key={idx} className="bg-slate-100/70 p-2 rounded-lg flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-slate-900">{p.projectTitle}</span>
                <span className="text-slate-500 block text-[10px]">Ref: {p.tenderRef}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                  Warranty: {p.warrantyValidTill}
                </span>
                {p.defectFlagCount > 0 && (
                  <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                    {p.defectFlagCount} Defects Logged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
