"use client";

import React, { useMemo } from "react";
import { Calendar, TrendingUp, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useLocation } from "@/context/LocationContext";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";
import { HudCardFrame, LiveDot, LiveTelemetryValue } from "./hud/HudPrimitives";

export interface ComplaintsTrendDataPoint {
  date: string;
  dayNum: number;
  total: number;
  resolved: number;
}

interface ComplaintsTrendChartProps {
  data?: ComplaintsTrendDataPoint[];
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

// Custom Data Dot Node
const CustomTrendDot = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;

  return (
    <g className="transition-all duration-300">
      <circle cx={cx} cy={cy} r={6} fill="#059669" fillOpacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill="#ffffff"
        stroke="#059669"
        strokeWidth={2.5}
        className="transition-transform duration-200 hover:scale-150 cursor-pointer"
      />
    </g>
  );
};

// Custom Tooltip
const CustomTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0]?.value || 0;
    const res = payload[0]?.payload?.resolved || Math.round(total * 0.84);
    const rate = Math.round((res / total) * 100);

    return (
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-3.5 shadow-xl text-slate-800 text-xs space-y-2 font-sans min-w-[175px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold">
          <span className="text-slate-900">{label}</span>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {rate}% Resolved
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Total Volume:</span>
            <span className="font-extrabold text-slate-900 font-display text-sm">
              <LiveTelemetryValue value={total} />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Resolved:</span>
            <span className="font-extrabold text-emerald-600 font-display text-sm">
              <LiveTelemetryValue value={res} />
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ComplaintsTrendChart({ data: customData, className = "" }: ComplaintsTrendChartProps) {
  const { location } = useLocation();
  const period = useCurrentPeriod();

  const citySeed = useMemo(() => getCitySeed(location.city), [location.city]);

  // REAL-TIME DATE CLAMPING: Data points exclusively from Day 1 up to TODAY
  const chartData = useMemo(() => {
    if (customData && customData.length > 0) return customData;

    const now = new Date();
    const today = now.getDate(); // e.g. 16
    const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);
    const offset = citySeed % 50;

    const days: number[] = [];
    for (let d = 1; d < today; d += 4) {
      days.push(d);
    }
    if (!days.includes(today)) {
      days.push(today);
    }

    return days.map((dayNum, idx) => {
      const label = `${dayNum} ${shortMonth}`;
      const total = Math.round(240 + Math.sin(idx + offset) * 110 + idx * 22);
      const res = Math.round(total * (0.81 + (idx % 3) * 0.04));

      return {
        date: label,
        dayNum,
        total: Math.max(110, total),
        resolved: res,
      };
    });
  }, [customData, citySeed]);

  return (
    <HudCardFrame className={`h-[380px] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 font-display">
              <Activity className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Complaints Trend</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Over-time volume in {location.city}
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
          <span>{period.label}</span>
        </div>
      </div>

      {/* Pro-Tier Continuous Curve Area Chart Stage */}
      <div className="flex-1 w-full relative my-1 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 16, right: 12, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="proEcoTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="60%" stopColor="#34d399" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
              dy={6}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
              domain={[0, "auto"]}
            />

            <RechartsTooltip content={<CustomTrendTooltip />} />

            <Area
              type="monotone"
              name="Total Complaints"
              dataKey="total"
              stroke="#059669"
              strokeWidth={3.5}
              fillOpacity={1}
              fill="url(#proEcoTrendGradient)"
              dot={<CustomTrendDot />}
              activeDot={{ r: 7, stroke: "#059669", strokeWidth: 3, fill: "#ffffff" }}
              style={{ filter: "drop-shadow(0 6px 12px rgba(5, 150, 105, 0.15))" }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-medium text-slate-500 z-10">
        <div className="flex items-center gap-2">
          <LiveDot color="emerald" size="sm" />
          <span className="text-slate-700 font-semibold">Continuous Trend Curve</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>+9.2% Resolution Velocity</span>
        </div>
      </div>
    </HudCardFrame>
  );
}
