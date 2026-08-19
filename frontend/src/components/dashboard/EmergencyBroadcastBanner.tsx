"use client";

import React from "react";
import { useBroadcasts } from "@/lib/broadcastStore";

export default function EmergencyBroadcastBanner() {
  const { broadcasts } = useBroadcasts();

  if (!broadcasts || broadcasts.length === 0) return null;

  // Find active broadcast
  const activeAlert = broadcasts.find(
    (b) => b.isActive !== false && (b.severity === "EMERGENCY_ALERT" || b.severity === "WARNING")
  ) || broadcasts[0];

  if (!activeAlert || activeAlert.isActive === false) return null;

  // Format ward target string
  const rawWards = activeAlert.targetWards || activeAlert.targetWardIds || ["BMC Ward 3", "BMC Ward 7", "BMC Ward 11", "BMC Ward 15"];
  let targetWardsText = "Wards 3, 7, 11 & 15";
  if (Array.isArray(rawWards) && rawWards.length > 0) {
    const formattedNums = rawWards.map(w => w.replace(/^BMC Ward\s*/i, "").trim());
    if (formattedNums.length > 1) {
      const last = formattedNums[formattedNums.length - 1];
      const initial = formattedNums.slice(0, -1).join(", ");
      targetWardsText = `Wards ${initial} & ${last}`;
    } else {
      targetWardsText = `Ward ${formattedNums[0]}`;
    }
  }

  const bodyText = activeAlert.body || "Heavy waterlogging on Cuttack Road & Patia corridor.";
  const helplineText = activeAlert.emergencyHelpline || "1800-345-0033";
  const phoneDigits = helplineText.split(" ")[0].replace(/[^0-9+]/g, "") || "18003450033";

  return (
    <div className="w-full bg-red-950/80 border border-red-500/50 text-red-200 rounded-2xl p-4 mb-6 shadow-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚨</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
              BMC Emergency Advisory
            </span>
            <span className="text-xs text-red-300">{targetWardsText}</span>
          </div>
          <p className="text-xs text-red-200 mt-1">
            {bodyText} Helpline: <strong>{helplineText}</strong>
          </p>
        </div>
      </div>
      <a 
        href={`tel:${phoneDigits}`} 
        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
      >
        Call {helplineText}
      </a>
    </div>
  );
}
