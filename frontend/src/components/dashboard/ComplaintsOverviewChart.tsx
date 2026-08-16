"use client";

import React, { useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useDynamicDate } from "@/hooks/useDynamicDate";
import { getGrievances } from "@/lib/grievanceStore";
import { HudCardFrame, LiveDot, LiveTelemetryValue } from "./hud/HudPrimitives";

export interface ComplaintsOverviewDataPoint {
  date: string;
  dayNum: number;
  received: number;
  resolved: number;
}

interface ComplaintsOverviewChartProps {
  data?: ComplaintsOverviewDataPoint[];
  className?: string;
}

function getCitySeed(cityName: string): number {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = (hash << 5) - hash + cityName.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function ComplaintsOverviewChart({ data: customData, className = "" }: ComplaintsOverviewChartProps) {
  const { location } = useLocation();
  const dateInfo = useDynamicDate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const citySeed = useMemo(() => getCitySeed(location.city), [location.city]);

  // REAL-TIME DATE CLAMPING: Data points generated strictly from Day 1 to TODAY
  const pillarsData = useMemo(() => {
    if (customData && customData.length > 0) return customData;

    const now = new Date();
    const today = now.getDate(); // e.g. 16
    const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);

    let grievances = [];
    try {
      grievances = getGrievances();
    } catch {
      grievances = [];
    }
    const countBonus = Math.min(grievances.length, 60);
    const seedOffset = citySeed % 100;

    const points: ComplaintsOverviewDataPoint[] = [];
    const totalDays = Math.max(1, today);

    for (let d = 1; d <= totalDays; d++) {
      const label = `${d} ${shortMonth}`;
      const rec = Math.round(280 + Math.sin(d + seedOffset) * 160 + d * 18 + countBonus * 2.5);
      const res = Math.round(rec * (0.82 + (d % 3) * 0.05));

      points.push({
        date: label,
        dayNum: d,
        received: Math.max(120, rec),
        resolved: Math.max(95, res),
      });
    }

    return points;
  }, [customData, citySeed]);

  const maxVal = useMemo(() => {
    return Math.max(...pillarsData.map((p) => p.received), 600);
  }, [pillarsData]);

  const hoveredPoint = hoveredIdx !== null ? pillarsData[hoveredIdx] : null;

  return (
    <HudCardFrame className={`h-[400px] ${className}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 font-display">
              <BarChart3 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Complaints Overview</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {dateInfo.monthYearLabel} · 1-{dateInfo.currentDay} ({location.city})
          </p>
        </div>

        {/* Top-Right Live Badge */}
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
          <LiveDot color="emerald" size="sm" />
          <span>Live</span>
        </div>
      </div>

      {/* Organic Growth Bar Stage */}
      <div className="flex-1 w-full relative my-3 flex items-end justify-between gap-1 px-1 z-10">
        {/* Subtle Bottom Axis Line */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-slate-200" aria-hidden="true" />

        {/* Hover Crosshair Guide Line */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-0 bottom-0 w-px border-r border-dashed border-emerald-400 pointer-events-none transition-all duration-150 z-20"
            style={{
              left: `${((hoveredIdx + 0.5) / pillarsData.length) * 100}%`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Render Bars with Organic Green Gradient Scale */}
        {pillarsData.map((item, idx) => {
          const heightPct = Math.max(14, Math.min(96, Math.round((item.received / maxVal) * 100)));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 h-full flex flex-col justify-end items-center relative group/pillar cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              tabIndex={0}
              aria-label={`${item.date}: ${item.received} complaints received, ${item.resolved} resolved`}
            >
              {/* Organic Green Gradient Bar */}
              <div
                className={`w-full max-w-[14px] rounded-t-xl bg-gradient-to-t from-emerald-600 via-emerald-500 to-mint-400 relative transition-all duration-500 ease-out origin-bottom ${
                  isHovered ? "brightness-110 scale-y-[1.03] shadow-md shadow-emerald-500/20" : "opacity-90 hover:opacity-100"
                }`}
                style={{
                  height: `${heightPct}%`,
                  transitionDelay: `${idx * 15}ms`,
                }}
              >
                {/* Top Cap Highlight */}
                <div
                  className="absolute top-0 inset-x-0 h-1 rounded-t-xl bg-white/40"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Glass Tooltip */}
      {hoveredPoint && (
        <div className="absolute top-16 right-6 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-3.5 shadow-xl text-slate-800 text-xs space-y-1.5 z-30 font-sans animate-fade-in min-w-[180px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-bold">
            <span className="text-slate-900">{hoveredPoint.date}</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Day {hoveredPoint.dayNum}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Received:</span>
            <span className="font-extrabold text-slate-900 font-display">
              <LiveTelemetryValue value={hoveredPoint.received} />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Resolved:</span>
            <span className="font-extrabold text-emerald-600 font-display">
              <LiveTelemetryValue value={hoveredPoint.resolved} />
            </span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Resolution Rate:</span>
            <span>{Math.round((hoveredPoint.resolved / hoveredPoint.received) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Legend & Status Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block shadow-sm" aria-hidden="true" />
            <span className="text-slate-700 font-semibold">Received Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block shadow-sm" aria-hidden="true" />
            <span className="text-slate-700 font-semibold">Resolved Rate</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Updated live</span>
        </div>
      </div>
    </HudCardFrame>
  );
}
