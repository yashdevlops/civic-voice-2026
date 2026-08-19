"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Send, ShieldAlert, ArrowLeft, CheckCircle2, PhoneCall, Radio } from "lucide-react";
import { useBroadcasts } from "@/lib/broadcastStore";
import { MunicipalDeptCode, MUNICIPAL_DEPARTMENTS } from "@/lib/grievance";
import { BroadcastSeverity } from "@/lib/types/advancedFeatures";

export default function CommissionerBroadcastDispatcher() {
  const router = useRouter();
  const { publishBroadcast } = useBroadcasts();

  const [headline, setHeadline] = useState("🚨 BMC EMERGENCY ALERT: HIGH MONSOON INUNDATION");
  const [body, setBody] = useState("Heavy waterlogging detected. Dewatering pumps deployed across patia and Cuttack Road.");
  const [severity, setSeverity] = useState<BroadcastSeverity>("EMERGENCY_ALERT");
  const [targetWards, setTargetWards] = useState("BMC Ward 3, BMC Ward 7, BMC Ward 15");
  const [emergencyDepartment, setEmergencyDepartment] = useState<MunicipalDeptCode>("public_safety");
  const [emergencyHelpline, setEmergencyHelpline] = useState("1800-345-0033");
  const [pumpLocation, setPumpLocation] = useState("Patia Canal Outfall & Rasulgarh Junction");

  const [published, setPublished] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wardList = targetWards.split(",").map(w => w.trim());

    publishBroadcast({
      targetWardIds: wardList,
      severity,
      headline,
      body,
      emergencyDepartment,
      emergencyHelpline,
      pumpDeploymentLocation: pumpLocation,
    });

    setPublished(true);
    setTimeout(() => {
      router.push("/commissioner/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/commissioner/dashboard" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Commissioner Executive Suite
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded">
                COMMISSIONER EMERGENCY COMMAND
              </span>
              <h1 className="text-xl font-extrabold text-white mt-1 font-display">
                Citywide Geo-Fenced Emergency Broadcast Dispatcher
              </h1>
            </div>
          </div>

          {published ? (
            <div className="bg-emerald-950 border border-emerald-500/40 p-6 rounded-xl text-center space-y-2 animate-fade-in">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-extrabold text-white">Emergency Alert Blasted Citywide!</h3>
              <p className="text-xs text-emerald-300">
                Pulsing high-priority banner is live across all citizen portals & dashboards. Redirecting to Executive Portal…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-300">
              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Alert Severity Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeverity("EMERGENCY_ALERT")}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      severity === "EMERGENCY_ALERT" ? "bg-red-600 text-white border-red-500" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    🚨 EMERGENCY ALERT
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("WARNING")}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      severity === "WARNING" ? "bg-amber-600 text-white border-amber-500" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    ⚠️ WARNING ADVISORY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("ADVISORY")}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      severity === "ADVISORY" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    ℹ️ GENERAL ADVISORY
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Headline Text *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Detailed Emergency Body / Instructions *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                    Target Wards (Comma Separated) *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                    value={targetWards}
                    onChange={(e) => setTargetWards(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                    Emergency Helpline Number *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500 outline-none font-mono"
                    value={emergencyHelpline}
                    onChange={(e) => setEmergencyHelpline(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
                >
                  <Send className="h-4 w-4" />
                  <span>Broadcast Citywide Emergency Alert</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
