"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendType = "neutral",
  className = "",
}: StatCardProps) {
  return (
    <div className={cn("bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between", className)}>
      <div className="flex justify-between items-start">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
          {title}
        </span>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">
          {value}
        </span>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span
              className={cn(
                trendType === "up" && "text-emerald-600",
                trendType === "down" && "text-red-500",
                trendType === "neutral" && "text-slate-400"
              )}
            >
              {trend}
            </span>
            <span className="text-slate-400">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}
