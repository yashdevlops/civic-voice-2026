/**
 * useLiveTimestamp.ts — A small hook that keeps relative timestamps ("Just now",
 * "X mins ago") up to date as real time passes.
 *
 * Calling `formatTicketTimestamp` once at render time would freeze the displayed
 * string at whatever it computed then. This hook forces a re-render on an interval
 * while the timestamp is still in the relative-time range (< 1 hour old).
 *
 * Usage:
 *   const label = useLiveTimestamp(ticket.created_at);
 *   // → "Just now" → "1 min ago" → "5 mins ago" → "01 Jun 2025, 10:30 AM"
 */

"use client";

import { useEffect, useReducer } from "react";
import { formatTicketTimestamp } from "@/lib/utils";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Returns a live-updating relative or absolute timestamp label.
 *
 * @param dateString ISO 8601 date string (or undefined/null)
 * @param intervalMs Tick interval in ms. Default 30 000 (30 s) — fine-grained
 *   enough for minute-level granularity without thrashing. Components that
 *   display timestamps older than 1 hour still run this effect but the interval
 *   fires cheaply and produces no visible change (the absolute format is stable).
 */
export function useLiveTimestamp(
  dateString?: string | null,
  intervalMs = 30_000
): string {
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!dateString) return;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return;

    // Only set up the interval if the timestamp is in the relative range.
    // Once it crosses 1 hour, the absolute format is stable — no need to tick.
    const ageMs = Date.now() - date.getTime();
    if (ageMs >= ONE_HOUR_MS) return;

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [dateString, intervalMs]);

  return formatTicketTimestamp(dateString);
}
