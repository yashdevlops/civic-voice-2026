"use client";

import React, { useState, useEffect } from "react";

// ── Eco-Civic Live Indicator Dot ──────────────────────────────────────────────
/**
 * Soft green/emerald pulse dot with an expanding fading ring.
 */
export function LiveDot({
  color = "emerald",
  size = "md",
  className = "",
}: {
  color?: "emerald" | "amber" | "teal" | "forest";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  let dotBg = "bg-emerald-500";
  let ringBorder = "border-emerald-500/50";

  if (color === "amber") {
    dotBg = "bg-amber-500";
    ringBorder = "border-amber-500/50";
  } else if (color === "teal") {
    dotBg = "bg-teal-500";
    ringBorder = "border-teal-500/50";
  } else if (color === "forest") {
    dotBg = "bg-emerald-700";
    ringBorder = "border-emerald-700/50";
  }

  const dotSize = size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2";
  const ringSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden="true">
      {/* Soft expanding ring */}
      <span
        className={`absolute rounded-full border ${ringBorder} animate-[heartbeatRing_2.5s_ease-out_infinite] motion-reduce:hidden ${ringSize}`}
      />
      {/* Solid Core Dot */}
      <span className={`relative rounded-full ${dotBg} animate-pulse ${dotSize}`} />
    </div>
  );
}

// ── Eco-Civic Live Telemetry Value ─────────────────────────────────────────────
/**
 * Smooth value transition counting component for real data readouts.
 */
export function LiveTelemetryValue({
  value,
  duration = 700,
  formatter,
  className = "",
}: {
  value: number | string;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState<number | string>(value);

  useEffect(() => {
    const numericTarget = typeof value === "number" ? value : parseFloat(value.toString().replace(/,/g, ""));
    const numericStart = typeof displayValue === "number" ? displayValue : parseFloat(displayValue.toString().replace(/,/g, ""));

    if (isNaN(numericTarget) || isNaN(numericStart) || numericTarget === numericStart) {
      setDisplayValue(value);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(numericStart + (numericTarget - numericStart) * easedProgress);

      if (formatter) {
        setDisplayValue(formatter(current));
      } else {
        setDisplayValue(typeof value === "number" ? current : current.toLocaleString());
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, formatter]);

  return <span className={className}>{displayValue}</span>;
}

// ── Eco-Civic White & Emerald Card Shell ──────────────────────────────────────
/**
 * Clean white-glass card shell with soft emerald border and ambient elevation shadow.
 * ZERO dark obsidian backgrounds, ZERO corner brackets, ZERO scanlines.
 */
export function HudCardFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-emerald-500/15 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-[0_20px_50px_-20px_rgba(16,185,129,0.12)] hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.18)] hover:border-emerald-500/30 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

// Legacy Stubs for Backward Compatibility
export function HudScanSweep() {
  return null;
}

export function HudGridFloor({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 bg-emerald-50/40 opacity-50 pointer-events-none ${className}`} />
  );
}
