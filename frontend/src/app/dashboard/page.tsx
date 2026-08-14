"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, MapPin, Calendar, Compass } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MOCK_KPIS, MOCK_COMPLAINTS_CHART, MOCK_CATEGORIES_DONUT } from "@/lib/mock-data";
import StatCard from "@/components/StatCard";
import StatusPill from "@/components/StatusPill";
import { useAuth } from "@/lib/auth";

export default function DashboardHome() {
  const { user } = useAuth();
  const userName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-transparent text-white flex flex-col justify-between p-6 md:p-8 min-h-[220px] md:min-h-[260px] w-full shadow-md">
        {/* Background Skyline photo */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: "url('https://i.pinimg.com/1200x/2f/30/26/2f302689882ab91b0f175561330c9483.jpg')"
          }}
        />
        {/* Contrast Overlay Scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />

        <div className="relative z-10 space-y-3">
          <div>
            <StatusPill label="Live Civic Portal" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-display flex items-center gap-2 flex-wrap">
              Welcome back, {userName}! <span className="animate-wave">👋</span>
            </h1>
            <p className="text-white/80 text-xs md:text-sm max-w-md font-medium leading-relaxed">
              Here&apos;s what&apos;s happening in your city today.
            </p>
          </div>
        </div>

        {/* Banner stat chips (translucent glass KPI cards) */}
        <div className="relative z-10 grid grid-cols-1 min-col-[400px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {MOCK_KPIS.map((kpi, idx) => {
            const isPending = kpi.label.toLowerCase() === "pending";
            return (
              <StatCard
                key={idx}
                label={kpi.label}
                value={kpi.value}
                trend={kpi.trend}
                trendUp={!isPending && kpi.trendUp}
                glass={true}
              />
            );
          })}
        </div>
      </div>

      {/* 3-Column Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Complaints Overview */}
        <div className="dash-card flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Complaints Overview</h2>
              <p className="text-xs text-slate-500">Monthly submission vs resolution metrics</p>
            </div>
            <select className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-control px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MOCK_COMPLAINTS_CHART}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#151616ff" />
                <YAxis stroke="#94A3B8" domain={[0, 1000]} ticks={[0, 250, 500, 750, 1000]} />
                <RechartsTooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <Area
                  type="monotone"
                  name="Received"
                  dataKey="received"
                  stroke="#2E7D32"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReceived)"
                />
                <Area
                  type="monotone"
                  name="Resolved"
                  dataKey="resolved"
                  stroke="#166534"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Top Issue Categories */}
        <div className="dash-card flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Issue Categories</h2>
              <p className="text-xs text-slate-500">Distribution of civic complaints</p>
            </div>
            <a href="/dashboard/analytics" className="text-xs text-primary hover:underline font-semibold">
              View All
            </a>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORIES_DONUT}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MOCK_CATEGORIES_DONUT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">1.2K</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Issues</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 px-2 text-xs">
              {MOCK_CATEGORIES_DONUT.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                  <span className="font-semibold text-slate-800 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Complaint Heatmap */}
        <div className="dash-card flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Complaint Heatmap</h2>
              <p className="text-xs text-slate-500">Live geo-density mapping</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-control px-2 py-0.5">
              <MapPin className="h-3 w-3 text-red-500" />
              Bengaluru
            </span>
          </div>

          {/* Lightweight Mock Heatmap Widget */}
          <div className="flex-1 relative rounded-control border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
            {/* Styled vector light grid representing a city layout */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-200/50" strokeWidth="0.5">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Fake road networks */}
              <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#E2E8F0" strokeWidth="6" />
              <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#E2E8F0" strokeWidth="5" />
              <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#E2E8F0" strokeWidth="6" />
            </svg>

            {/* Heat spots (radial gradient glow overlays) */}
            <div className="absolute w-24 h-24 rounded-full bg-red-500/20 blur-xl top-[25%] left-[35%]" />
            <div className="absolute w-6 h-6 rounded-full bg-red-600/70 border border-red-400 top-[28%] left-[38%] animate-ping" />
            <div className="absolute w-3 h-3 rounded-full bg-red-600 top-[29.5%] left-[39.5%]" />

            <div className="absolute w-32 h-32 rounded-full bg-amber-500/20 blur-xl bottom-[15%] left-[20%]" />
            <div className="absolute w-16 h-16 rounded-full bg-orange-500/25 blur-lg bottom-[20%] left-[25%]" />
            <div className="absolute w-4 h-4 rounded-full bg-orange-500/80 border border-orange-300 bottom-[26%] left-[30%]" />

            <div className="absolute w-20 h-20 rounded-full bg-yellow-500/20 blur-lg top-[45%] right-[20%]" />
            <div className="absolute w-3 h-3 rounded-full bg-yellow-500 top-[49%] right-[25%]" />

            {/* Water leak hotspot */}
            <div className="absolute w-16 h-16 rounded-full bg-blue-500/20 blur-lg top-[15%] right-[40%]" />
            <div className="absolute w-3.5 h-3.5 rounded-full bg-blue-500/80 top-[20%] right-[45%]" />

            {/* Label overlays */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded-control shadow-md flex items-center gap-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              High Density Zone
            </div>

            <div className="absolute top-3 left-3 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-control border border-slate-100 shadow flex items-center gap-1">
              <span>Bengaluru Central</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              12 Active Heatspots
            </span>
            <a
              href="https://maps.google.com/?q=Bengaluru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
            >
              View Map →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
