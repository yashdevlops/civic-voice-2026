"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Send, CheckCircle2, PhoneCall, Radio, ShieldAlert } from "lucide-react";
import { useBroadcasts } from "@/lib/broadcastStore";
import { BroadcastSeverity } from "@/lib/types/advancedFeatures";

interface BroadcastEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BroadcastEmergencyModal({ isOpen, onClose }: BroadcastEmergencyModalProps) {
  const { publishBroadcast } = useBroadcasts();

  const [headline, setHeadline] = useState("Flash Flood & Waterlogging Warning");
  const [body, setBody] = useState("Heavy monsoon rainfall causing severe waterlogging. 6 Mobile Dewatering Pumps deployed.");
  const [severity, setSeverity] = useState<BroadcastSeverity>("EMERGENCY_ALERT");
  const [targetWards, setTargetWards] = useState("BMC Ward 3, BMC Ward 7, BMC Ward 15");
  const [emergencyHelpline, setEmergencyHelpline] = useState("1800-345-0033");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const wardList = targetWards.split(",").map((w) => w.trim());

    publishBroadcast({
      targetWardIds: wardList,
      severity,
      headline: severity === "EMERGENCY_ALERT" ? `🚨 BMC EMERGENCY ALERT: ${headline}` : `⚠️ BMC ADVISORY: ${headline}`,
      body,
      emergencyDepartment: "public_safety",
      emergencyHelpline,
      pumpDeploymentLocation: "Patia Canal Outfall & Rasulgarh Junction",
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans text-slate-100">
      <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-red-950/80 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-600/30">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded">
                COMMISSIONER EMERGENCY COMMAND
              </span>
              <h2 className="text-base font-extrabold text-white mt-0.5 font-display">
                Broadcast Ward Emergency Advisory
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs font-medium">
          {isSuccess ? (
            <div className="bg-emerald-950 border border-emerald-500/40 p-6 rounded-xl text-center space-y-2 animate-fade-in">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-extrabold text-white">Emergency Advisory Live Citywide!</h3>
              <p className="text-xs text-emerald-300 font-medium">
                Pulsing high-priority banner activated across all Citizen Portals & Dashboards.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Severity Selection */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Severity Level *
                </label>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSeverity("EMERGENCY_ALERT")}
                    className={`p-2.5 rounded-xl border font-extrabold transition-all cursor-pointer ${
                      severity === "EMERGENCY_ALERT"
                        ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    🚨 CRITICAL EMERGENCY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("WARNING")}
                    className={`p-2.5 rounded-xl border font-extrabold transition-all cursor-pointer ${
                      severity === "WARNING"
                        ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    ⚠️ WARNING
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("ADVISORY")}
                    className={`p-2.5 rounded-xl border font-extrabold transition-all cursor-pointer ${
                      severity === "ADVISORY"
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    ℹ️ ADVISORY
                  </button>
                </div>
              </div>

              {/* Target Wards */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Target Wards (e.g. Ward 3, 7, 11, 15, or &quot;All BMC Wards&quot;) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                  value={targetWards}
                  onChange={(e) => setTargetWards(e.target.value)}
                />
              </div>

              {/* Headline */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Alert Headline *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-extrabold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Detailed Instructions & Action Plan *
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-red-500 outline-none"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {/* Helpline */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Emergency Helpline Phone Number *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold focus:ring-2 focus:ring-red-500 outline-none"
                  value={emergencyHelpline}
                  onChange={(e) => setEmergencyHelpline(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Dispatch Real-Time Emergency Advisory</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
