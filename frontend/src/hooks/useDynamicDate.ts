"use client";

import { useState, useEffect } from "react";

export interface DynamicDateInfo {
  formattedDate: string;   // e.g. "16 August 2026"
  monthYearLabel: string;  // e.g. "August 2026"
  dayLabels: string[];     // e.g. ["1 Aug", "5 Aug", "10 Aug", "15 Aug", "20 Aug", "25 Aug", "30 Aug"]
  currentDay: number;      // e.g. 16
  currentMonth: string;    // e.g. "August"
  currentYear: number;     // e.g. 2026
}

function computeDynamicDate(): DynamicDateInfo {
  const now = new Date();
  
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const monthYearLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);

  const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Generate clean 5-day step interval day labels for charts
  const dayLabels: string[] = [];
  for (let d = 1; d <= daysInMonth; d += 5) {
    dayLabels.push(`${d} ${shortMonth}`);
  }
  if (!dayLabels.includes(`${daysInMonth} ${shortMonth}`)) {
    dayLabels.push(`${daysInMonth} ${shortMonth}`);
  }

  return {
    formattedDate,
    monthYearLabel,
    dayLabels,
    currentDay,
    currentMonth: new Intl.DateTimeFormat("en-US", { month: "long" }).format(now),
    currentYear: now.getFullYear(),
  };
}

/**
 * Hook providing live temporal engine date metrics with automatic midnight recalculation.
 */
export function useDynamicDate(): DynamicDateInfo {
  const [dateInfo, setDateInfo] = useState<DynamicDateInfo>(() => computeDynamicDate());

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const scheduleMidnightUpdate = () => {
      const now = new Date();
      // Calculate milliseconds until next midnight: 00:00:01
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1
      );
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

      timerId = setTimeout(() => {
        setDateInfo(computeDynamicDate());
        scheduleMidnightUpdate();
      }, msUntilMidnight);
    };

    scheduleMidnightUpdate();

    // Secondary 60s backup interval
    const backupInterval = setInterval(() => {
      const fresh = computeDynamicDate();
      if (fresh.formattedDate !== dateInfo.formattedDate) {
        setDateInfo(fresh);
      }
    }, 60_000);

    return () => {
      if (timerId) clearTimeout(timerId);
      clearInterval(backupInterval);
    };
  }, [dateInfo.formattedDate]);

  return dateInfo;
}
