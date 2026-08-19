"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { PieChart as PieIcon, ArrowRight } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { getGrievances } from "@/lib/grievanceStore";
import { HudCardFrame, LiveDot, LiveTelemetryValue } from "./hud/HudPrimitives";

export interface CategoryItem {
  name: string;
  value: number; // Percentage
  rawCount: number;
  color: string;
  glowColor: string;
  fillClass: string;
}

interface TopCategoriesGaugeProps {
  categories?: CategoryItem[];
  totalIssues?: number | string;
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

export default function TopCategoriesGauge({
  categories: customCategories,
  totalIssues: customTotal,
  className = "",
}: TopCategoriesGaugeProps) {
  const { location } = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const citySeed = useMemo(() => getCitySeed(location.city), [location.city]);

  // Green-forward category palette with warm amber as the one single accent
  const categoriesData = useMemo<CategoryItem[]>(() => {
    if (customCategories && customCategories.length > 0) return customCategories;

    const catMap: Record<string, { raw: number; color: string; glowColor: string; fillClass: string }> = {
      "Roads & Potholes": { raw: 38 + (citySeed % 14), color: "#059669", glowColor: "rgba(5, 150, 105, 0.25)", fillClass: "bg-emerald-600" },
      "Water Supply":     { raw: 26 + ((citySeed >> 2) % 10), color: "#0d9488", glowColor: "rgba(13, 148, 136, 0.25)", fillClass: "bg-teal-600" },
      "Street Lights":    { raw: 22 + ((citySeed >> 4) % 8), color: "#f59e0b", glowColor: "rgba(245, 158, 11, 0.25)", fillClass: "bg-amber-500" },
      "Sanitation":       { raw: 18 + ((citySeed >> 1) % 6), color: "#34d399", glowColor: "rgba(52, 211, 153, 0.25)", fillClass: "bg-emerald-400" },
    };

    try {
      const live = getGrievances();
      live.forEach((g) => {
        const catName = g.departmentCode === "roads_potholes" ? "Roads & Potholes" :
                        g.departmentCode === "water_supply" ? "Water Supply" :
                        g.departmentCode === "street_lights" ? "Street Lights" : "Sanitation";
        if (catMap[catName]) {
          catMap[catName].raw += 1;
        }
      });
    } catch {
      // Fallback
    }

    const totalRaw = Object.values(catMap).reduce((acc, c) => acc + c.raw, 0);

    return Object.entries(catMap).map(([name, data]) => ({
      name,
      value: Math.round((data.raw / totalRaw) * 100),
      rawCount: data.raw,
      color: data.color,
      glowColor: data.glowColor,
      fillClass: data.fillClass,
    }));
  }, [customCategories, citySeed]);

  const totalCalculatedIssues = useMemo(() => {
    if (customTotal !== undefined) return customTotal;
    const totalRaw = categoriesData.reduce((acc, c) => acc + c.rawCount, 0);
    return totalRaw;
  }, [customTotal, categoriesData]);

  // Concentric Ring Arc calculations (Radius R = 78, Circumference C = 2 * PI * 78 = 490.09)
  const radius = 78;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each category segment
  const categorySegments = useMemo(() => {
    let accumulatedOffset = 0;
    const gap = 10; // Gap between segments

    return categoriesData.map((cat) => {
      const segLength = Math.max(12, (cat.value / 100) * circumference);
      const dashArray = `${segLength - gap} ${circumference - (segLength - gap)}`;
      const dashOffset = -accumulatedOffset;
      accumulatedOffset += segLength;

      return {
        ...cat,
        dashArray,
        dashOffset,
      };
    });
  }, [categoriesData, circumference]);

  return (
    <HudCardFrame className={`h-[400px] ${className}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 font-display">
              <PieIcon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Top Issue Categories</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Distribution in {location.city}
          </p>
        </div>

        {/* Top-Right Navigation Link */}
        <Link
          href="/dashboard/analytics"
          className="group/btn text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-1 transition-all shadow-sm"
        >
          <span>Analytics</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>

      {/* PERFECTLY CENTERED RING STAGE */}
      <div className="relative aspect-square w-full max-w-[220px] md:max-w-[240px] mx-auto flex items-center justify-center my-1 z-10">
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-0 w-full h-full overflow-visible"
        >
          {/* Background Ambient Track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="16"
          />

          {/* Thick Glowing Segmented Slices */}
          <g transform="rotate(-90 120 120)">
            {categorySegments.map((seg, idx) => (
              <circle
                key={idx}
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={activeCategory === seg.name ? "20" : "16"}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  opacity: activeCategory && activeCategory !== seg.name ? 0.35 : 1,
                }}
                onMouseEnter={() => setActiveCategory(seg.name)}
                onMouseLeave={() => setActiveCategory(null)}
              />
            ))}
          </g>
        </svg>

        {/* PERFECT CENTERING INNER CORE READOUT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center z-20">
          <span className="text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            {activeCategory ? (
              categoriesData.find((c) => c.name === activeCategory)?.value + "%"
            ) : (
              <LiveTelemetryValue value={totalCalculatedIssues} />
            )}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <LiveDot color="emerald" size="sm" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {activeCategory ? activeCategory : "Total Issues"}
            </span>
          </div>
        </div>
      </div>

      {/* Legend Grid with Proportional Progress Underlines */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full pt-3 border-t border-slate-100 text-xs font-medium z-10">
        {categoriesData.map((cat, idx) => (
          <div
            key={idx}
            className="flex flex-col min-w-0 group/item cursor-pointer space-y-1"
            onMouseEnter={() => setActiveCategory(cat.name)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="flex items-center justify-between min-w-0 gap-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5 min-w-0 truncate">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="font-extrabold text-slate-900 shrink-0 font-display">
                {cat.value}%
              </span>
            </div>

            {/* Proportional Underline Progress Track */}
            <div className="h-1 rounded-full bg-slate-100 overflow-hidden w-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cat.fillClass}`}
                style={{ width: `${cat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </HudCardFrame>
  );
}
