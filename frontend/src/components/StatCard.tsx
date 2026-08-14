"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  from?: string;
  icon?: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export default function StatCard({
  label,
  value,
  trend,
  trendUp = true,
  from,
  icon,
  className,
  glass = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 p-4 rounded-xl transition-all duration-150",
        glass
          ? "glass-card shadow-sm"
          : "stat-card border-t-4 bg-white shadow-card border-slate-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            glass ? "text-slate-500" : "text-slate-500"
          )}
        >
          {label}
        </span>
        {icon && !glass && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between mt-1 gap-2 flex-wrap">
        <p
          className={cn(
            "text-2xl font-bold font-display leading-none",
            glass ? "text-slate-900" : "text-slate-900"
          )}
        >
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-bold shrink-0",
              trendUp ? "text-green-600" : "text-red-500"
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}
      </div>
      {from && !glass && (
        <span className="text-xs text-slate-400 mt-1">{from}</span>
      )}
    </div>
  );
}
