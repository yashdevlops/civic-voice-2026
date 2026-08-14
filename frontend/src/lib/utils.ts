/**
 * utils.ts — Shared utility functions.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely (resolves conflicts). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format an ISO datetime string to a readable local date-time. */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Shorten a UUID to its first 8 characters for display purposes. */
export function shortId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

/** Format a number as Indian Rupees (₹). */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Capitalise the first letter of a string. */
export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Map a category string to its CSS class name segment. */
export function categoryClass(category: string): string {
  return `badge-cat-${category.toLowerCase()}`;
}

/** Map a status string to its CSS class name segment. */
export function statusClass(status: string): string {
  return `badge-status-${status.toLowerCase().replace("_", "_")}`;
}

/**
 * Interpolate a string template, replacing {{key}} placeholders.
 * e.g. interpolate("Hello {{name}}!", { name: "World" }) → "Hello World!"
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`
  );
}

/**
 * Format a ticket timestamp as a relative string ("Just now", "X mins ago")
 * for recent events, or an absolute locale-aware date-time for older ones.
 *
 * Uses Intl.DateTimeFormat(undefined, ...) so the format respects the user's
 * OS/browser locale — do not hard-code "en-IN" here.
 *
 * Returns "—" for missing or malformed input (never throws, never shows "Invalid Date").
 */
export function formatTicketTimestamp(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
