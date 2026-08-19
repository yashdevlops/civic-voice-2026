"use client";
export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import { Award, ShieldCheck, Sparkles, CheckCircle2, Ticket, Car, Droplet, Building2, ArrowLeft } from "lucide-react";
import { useCivicCredits } from "@/lib/civicCreditStore";
import CommunityVerificationCard from "@/components/dashboard/CommunityVerificationCard";

export default function CivicCreditsPage() {
  const { profile, missions } = useCivicCredits();

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-50 text-slate-900 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-4 py-8 sm:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Gamified Citizen Rewards System
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                Civic Credit Wallet & Municipal Perks
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Earn credits by reporting civic issues, auditing completed work, and voting on participatory budget proposals. Redeem for real property tax rebates and water utility discounts.
              </p>
            </div>

            {/* Credit Balance Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 border-2 border-emerald-500 rounded-2xl p-5 shadow-2xl text-center space-y-1 shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                Your Civic Balance
              </span>
              <p className="text-3xl font-black text-amber-400 font-mono">
                {profile.totalCredits} <span className="text-xs font-normal text-white">Credits</span>
              </p>
              <div className="inline-block bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                {profile.tier.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
        
        {/* ── Municipal Rebate Perks Grid ──────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-600" />
            Available Municipal Utility & Tax Rebates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rebate 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">5% Property Tax Rebate</h3>
                <p className="text-xs text-slate-500 mt-0.5">Applied to annual BMC Holding Tax bill.</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Requirement: 200 Credits</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {profile.totalCredits >= 200 ? "Unlocked 🎉" : "Requires 25 More"}
                </span>
              </div>
            </div>

            {/* Rebate 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">₹100 Off Water Utility Bill</h3>
                <p className="text-xs text-slate-500 mt-0.5">Direct credit on monthly PHE water bill.</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Requirement: 100 Credits</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Unlocked & Active ✓
                </span>
              </div>
            </div>

            {/* Rebate 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Free BMC Smart Parking Pass</h3>
                <p className="text-xs text-slate-500 mt-0.5">20 Hours free at Sahid Nagar Multilevel Parking.</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Requirement: 50 Credits</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Unlocked & Active ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Verification Radar ────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Nearby Community Audit Missions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((m) => (
              <CommunityVerificationCard key={m.id} mission={m} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
