"use client";

import React from "react";
import { Download, Calendar, MapPin, ArrowUpRight, ArrowDownRight, Award, Clock, Star, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { MOCK_ANALYTICS_KPIS, MOCK_COMPLAINTS_TREND, MOCK_AREAS } from "@/lib/mock-data";
import StatCard from "@/components/StatCard";

export default function Analytics() {
  // Max area count to scale progress bars proportionally
  const maxCount = Math.max(...MOCK_AREAS.map((a) => a.count));

  return (
    <div className="space-y-6">
      {/* Top Filter and Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">
            Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500">Overview of civic performance indicators and metrics</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export Button */}
          <button className="btn-outline flex items-center gap-1.5 py-2 text-xs">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_ANALYTICS_KPIS.map((kpi, idx) => {
          // Identify icons
          let Icon = FileText;
          if (idx === 1) Icon = Clock;
          if (idx === 2) Icon = Award;
          if (idx === 3) Icon = Star;

          // Determine trend status. Avg Resolution Time decrease is positive (so green)
          const isTime = idx === 1;
          const isTrendPositive = isTime ? kpi.trend.includes("↓") : kpi.trend.includes("↑");
          const trendColor = isTrendPositive ? "text-green-600" : "text-red-500";
          const TrendIcon = isTrendPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <div key={idx} className="stat-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {kpi.label}
                </span>
                <span className="h-8 w-8 rounded-full bg-primary-tint text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-extrabold text-slate-800 font-display">{kpi.value}</p>
                <span className={`inline-flex items-center text-xs font-semibold mt-1 ${trendColor}`}>
                  {kpi.trend} from last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Complaints Trend & Complaints by Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Complaints Trend Chart (2-column scale) */}
        <div className="dash-card flex flex-col lg:col-span-2 h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Complaints Trend</h2>
              <p className="text-xs text-slate-500">Over-time trend of total logged complaints</p>
            </div>
            <select className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-control px-2 py-1">
              <option>This Month</option>
              <option>This Quarter</option>
            </select>
          </div>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_COMPLAINTS_TREND}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Complaints"
                  stroke="#2E7D32" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Area */}
        <div className="dash-card flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Complaints by Area</h2>
              <p className="text-xs text-slate-500">Top wards with active tickets</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-primary">
              View All
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {MOCK_AREAS.map((a, idx) => {
              const widthPct = Math.round((a.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {a.area}
                    </span>
                    <span className="text-slate-900 font-bold">{a.count} tickets</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden w-full">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
