"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  label?: string;
  className?: string;
  pulse?: boolean;
}

export default function StatusPill({
  label = "Live Civic Portal",
  className = "",
  pulse = true,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-primary/35 text-green-300 border border-primary/50 backdrop-blur-md rounded-full shadow-sm select-none",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full bg-green-400 shrink-0",
          pulse && "animate-pulse"
        )}
      />
      <span className="leading-none font-semibold">{label}</span>
    </span>
  );
}
