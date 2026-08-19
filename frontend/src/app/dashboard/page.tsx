"use client";
export const dynamic = 'force-dynamic';

import React, { useMemo } from "react";
import { MapPin, Calendar } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import { useAuth } from "@/lib/auth";
import { useLocation } from "@/context/LocationContext";
import { useDynamicDate } from "@/hooks/useDynamicDate";
import { getGrievances } from "@/lib/grievanceStore";
import ComplaintsOverviewChart from "@/components/dashboard/ComplaintsOverviewChart";
import TopCategoriesGauge from "@/components/dashboard/TopCategoriesGauge";
import ComplaintHeatmapCard from "@/components/dashboard/ComplaintHeatmapCard";
import { LiveDot, LiveTelemetryValue } from "@/components/dashboard/hud/HudPrimitives";
import GovtTenderBanner from "@/components/dashboard/GovtTenderBanner";
import UtilityOutageWidget from "@/components/broadcast/UtilityOutageWidget";
import CommunityVerificationCard from "@/components/dashboard/CommunityVerificationCard";
import { useCivicCredits } from "@/lib/civicCreditStore";
import EmergencyBroadcastBanner from "@/components/dashboard/EmergencyBroadcastBanner";

function getCitySeed(cityName: string): number {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = (hash << 5) - hash + cityName.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { location } = useLocation();
  const dateInfo = useDynamicDate();
  const { missions } = useCivicCredits();

  const userName = user?.name?.split(" ")[0] ?? "there";
  const citySeed = useMemo(() => getCitySeed(location.city), [location.city]);

  // Live Grievances Aggregation
  const liveGrievances = useMemo(() => {
    try {
      return getGrievances();
    } catch {
      return [];
    }
  }, []);

  // Dynamic KPIs tailored to city
  const cityKpis = useMemo(() => {
    const baseMult = 1 + (citySeed % 7) * 0.15;
    const totalCount = liveGrievances.length > 0 ? liveGrievances.length + Math.round(1200 * baseMult) : Math.round(1420 * baseMult);
    const resolvedCount = Math.round(totalCount * 0.82);
    const pendingCount = totalCount - resolvedCount;
    const avgSla = (3.8 + (citySeed % 3) * 0.4).toFixed(1);

    return [
      { label: "Total Complaints", numericValue: totalCount, displayValue: totalCount.toLocaleString(), trend: "+12% this month" },
      { label: "Resolved Issues", numericValue: resolvedCount, displayValue: resolvedCount.toLocaleString(), trend: "+18% this month" },
      { label: "Pending Triage", numericValue: pendingCount, displayValue: pendingCount.toLocaleString(), trend: "-4% this month" },
      { label: "Avg SLA Response", numericValue: parseFloat(avgSla), displayValue: `${avgSla} Days`, trend: "-0.5 days faster" },
    ];
  }, [citySeed, liveGrievances]);

  return (
    <div className="space-y-6">
      {/* Emergency Notification Banner */}
      <EmergencyBroadcastBanner />

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
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <StatusPill label="Live Civic Portal — Bhubaneswar (BMC)" />
            <LiveDot color="emerald" size="sm" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-display flex items-center gap-2 flex-wrap">
              Welcome back, {userName}! <span className="animate-wave">👋</span>
            </h1>
            <p className="text-white/80 text-xs md:text-sm max-w-md font-medium leading-relaxed">
              Here&apos;s what&apos;s happening in <span className="font-bold text-emerald-300">Bhubaneswar, Odisha</span> for <span className="font-bold text-white">{dateInfo.formattedDate}</span>.
            </p>
          </div>
        </div>

        {/* HUD Banner stat chips */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          {cityKpis.map((kpi, i) => (
            <div key={i} className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-xl p-3 relative overflow-hidden group shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  {kpi.label}
                </span>
                <LiveDot color={i === 2 ? "amber" : "emerald"} size="sm" />
              </div>
              <div className="text-lg md:text-xl font-extrabold text-white mt-1 font-mono tracking-tight">
                {typeof kpi.numericValue === "number" && !isNaN(kpi.numericValue) ? (
                  <LiveTelemetryValue value={kpi.numericValue} />
                ) : (
                  kpi.displayValue
                )}
                {i === 3 && " Days"}
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-300 mt-0.5 block">
                {kpi.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick-Access E-Procurement Banner */}
      <GovtTenderBanner />

      {/* Grid containing Utility Outages & Geo-Fenced Community Audit Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UtilityOutageWidget />
        {missions.length > 0 && <CommunityVerificationCard mission={missions[0]} />}
      </div>

      {/* 3-Column 3D Cyber-Civic HUD Spatial Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Complaints Overview (3D Layered Dual-Wave Area Chart) */}
        <ComplaintsOverviewChart />

        {/* 2. Top Issue Categories (3D Segmented Radial Arc / Speedometer Gauge) */}
        <TopCategoriesGauge />

        {/* 3. Complaint Heatmap (Normalized Card + Interactive Fullscreen City Map Modal) */}
        <ComplaintHeatmapCard />
      </div>
    </div>
  );
}
