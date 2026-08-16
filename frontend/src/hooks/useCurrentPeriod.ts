"use client";

import { useState, useEffect } from "react";
import { getCurrentMonthLabel, getTodayLabel, getMonthRange } from "@/lib/dateUtils";

export interface CurrentPeriod {
  label: string;
  rangeStart: Date;
  rangeEnd: Date;
  monthName: string;
  formattedToday: string;
}

function computePeriod(): CurrentPeriod {
  const now = new Date();
  const { start, end } = getMonthRange(now);
  const monthName = getCurrentMonthLabel(now);
  const formattedToday = getTodayLabel(now);

  return {
    label: monthName,
    rangeStart: start,
    rangeEnd: end,
    monthName,
    formattedToday,
  };
}

/**
 * Hook that computes the current reporting period dynamically.
 * Checks every 60 seconds and recomputes automatically at midnight rollover.
 */
export function useCurrentPeriod(): CurrentPeriod {
  const [period, setPeriod] = useState<CurrentPeriod>(() => computePeriod());

  useEffect(() => {
    // 60-second polling interval to detect day change across midnight
    const intervalId = setInterval(() => {
      const fresh = computePeriod();
      if (fresh.formattedToday !== period.formattedToday) {
        setPeriod(fresh);
      }
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [period.formattedToday]);

  return period;
}
