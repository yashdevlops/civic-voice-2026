"use client";
export const dynamic = 'force-dynamic';

import React, { useMemo } from "react";
import { Download, MapPin, Award, Clock, Star, FileText, Activity } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";
import ComplaintsTrendChart from "@/components/dashboard/ComplaintsTrendChart";
import { HudCardFrame, LiveDot, LiveTelemetryValue } from "@/components/dashboard/hud/HudPrimitives";

function getCitySeed(cityName: string): number {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = (hash << 5) - hash + cityName.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Analytics() {
  const { location } = useLocation();
  const period = useCurrentPeriod();

  const citySeed = useMemo(() => getCitySeed(location.city), [location.city]);

  // Dynamic KPIs tailored to city
  const analyticsKpis = useMemo(() => {
    const mult = 1 + (citySeed % 5) * 0.12;
    const totalCount = Math.round(3420 * mult);
    const avgRes = (2.4 + (citySeed % 3) * 0.3).toFixed(1);
    const slaComp = Math.min(98, 92 + (citySeed % 6));
    const satScore = (4.3 + (citySeed % 4) * 0.15).toFixed(1);

    return [
      { label: "Total Complaints Logged", numericValue: totalCount, displayValue: totalCount.toLocaleString(), trend: "↑ 12%" },
      { label: "Avg Resolution Time", numericValue: parseFloat(avgRes), displayValue: `${avgRes} Days`, trend: "↓ 0.8d" },
      { label: "SLA Compliance Rate", numericValue: slaComp, displayValue: `${slaComp}%`, trend: "↑ 3%" },
      { label: "Citizen Satisfaction", numericValue: parseFloat(satScore), displayValue: `${satScore} / 5`, trend: "↑ 0.2" },
    ];
  }, [citySeed]);

  // Dynamic Wards / Areas for current city with graduated green-forward ranking scale
  const cityAreas = useMemo(() => {
    const suffix = location.city;
    return [
      { area: `${suffix} Central Ward 12`, count: 180 + (citySeed % 60), color: "#059669", fillClass: "bg-emerald-600" },
      { area: `${suffix} North Division 04`, count: 140 + (citySeed % 45), color: "#0d9488", fillClass: "bg-teal-600" },
      { area: `${suffix} South Extension 08`, count: 110 + (citySeed % 35), color: "#10b981", fillClass: "bg-emerald-500" },
      { area: `${suffix} East Zone 19`, count: 85 + (citySeed % 25), color: "#34d399", fillClass: "bg-emerald-400" },
      { area: `${suffix} West Metro Ward 02`, count: 60 + (citySeed % 20), color: "#6ee7b7", fillClass: "bg-emerald-300" },
    ];
  }, [location.city, citySeed]);

  const maxCount = Math.max(...cityAreas.map((a) => a.count));

  const handleExport = () => {
    alert(`Exporting PDF performance report for ${location.label} (${period.monthName})...`);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">
              Analytics & Reports — {location.city}
            </h1>
            <LiveDot color="emerald" size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Performance analytics for <span className="font-semibold text-slate-700">{location.label}</span> ({period.monthName})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={handleExport} className="btn-outline flex items-center gap-1.5 py-2 text-xs cursor-pointer">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Eco-Civic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsKpis.map((kpi, idx) => {
          let Icon = FileText;
          if (idx === 1) Icon = Clock;
          if (idx === 2) Icon = Award;
          if (idx === 3) Icon = Star;

          return (
            <div key={idx} className="bg-white border border-emerald-500/15 rounded-2xl p-4 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.1)] hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between z-10">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {kpi.label}
                </span>
                <span className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 z-10">
                <p className="text-2xl font-extrabold text-slate-900 font-display">
                  <LiveTelemetryValue value={kpi.numericValue} />
                  {idx === 1 && " Days"}
                  {idx === 2 && "%"}
                  {idx === 3 && " / 5"}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-700">
                  <LiveDot color="emerald" size="sm" />
                  <span>{kpi.trend} from last period</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Complaints Trend & Complaints by Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Complaints Trend Chart (Eco-Civic Parity) */}
        <ComplaintsTrendChart className="lg:col-span-2" />

        {/* Complaints by Area Ward List (Eco-Civic Parity) */}
        <HudCardFrame className="h-[380px]">
          <div className="flex items-center justify-between mb-3 z-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 font-display">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span>Complaints by Area</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Top wards in {location.city}</p>
            </div>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              {location.city}
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 z-10 text-xs font-medium">
            {cityAreas.map((a, idx) => {
              const widthPct = Math.round((a.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1 group/ward cursor-pointer">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: a.color }} />
                      <span className="truncate">{a.area}</span>
                    </span>
                    <span className="text-slate-900 font-extrabold shrink-0 font-display">
                      <LiveTelemetryValue value={a.count} /> tickets
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden w-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${a.fillClass}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </HudCardFrame>

      </div>
    </div>
  );
}
