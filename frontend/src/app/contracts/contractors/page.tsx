"use client";
export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import { ShieldCheck, Star, Award, ArrowLeft, Building2 } from "lucide-react";
import { useContractorScorecards } from "@/lib/contractorStore";
import ContractorScorecardCard from "@/components/contracts/ContractorScorecardCard";

export default function PublicContractorScorecardsPage() {
  const { contractors } = useContractorScorecards();

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-50 text-slate-900 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-4 py-8 sm:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl space-y-4">
          <Link href="/contracts" className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Govt Tenders & E-Procurement
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                Public Quality & Transparency Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                BMC Empanelled Contractor Quality Scorecards
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Public performance ratings, on-time delivery rates, citizen audit quality scores, and 1-year defect liability warranty tracking for municipal work orders.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center space-y-0.5 shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Empanelled Contractors</span>
              <p className="text-2xl font-extrabold text-emerald-400">{contractors.length} Firms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contractors.map((c) => (
            <ContractorScorecardCard key={c.contractorId} contractor={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
