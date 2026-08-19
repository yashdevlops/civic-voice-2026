"use client";

import React from "react";
import { Droplet, Zap, Wrench, Clock, AlertCircle } from "lucide-react";
import { useBroadcasts } from "@/lib/broadcastStore";

export default function UtilityOutageWidget() {
  const { outages } = useBroadcasts();

  if (!outages || outages.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 font-sans text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <h3 className="font-extrabold text-sm text-slate-900 font-display">
            Scheduled Municipal Utility Outages
          </h3>
        </div>
        <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 uppercase">
          {outages.length} Disruptions Logged
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {outages.map((o) => (
          <div key={o.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
              {o.utilityType === "WATER_MAINTENANCE" ? (
                <Droplet className="h-4 w-4 text-blue-600" />
              ) : (
                <Zap className="h-4 w-4 text-amber-600" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{o.wardId} • {o.utilityType.replace("_", " ")}</span>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded">
                  {o.startTime}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Affected Streets: {o.affectedStreets.join(", ")}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                Helpline Dispatch: {o.helpline}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
