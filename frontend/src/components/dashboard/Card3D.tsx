"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  tiltAngle?: number;
}

/**
 * Shared 3D Card Wrapper
 * Applies consistent 3D perspective tilt on desktop screens and flattens on mobile (<768px).
 */
export default function Card3D({ children, className, tiltAngle = 5 }: Card3DProps) {
  return (
    <div
      className={cn(
        "dash-card flex flex-col h-[400px] transition-all duration-300",
        "sm:perspective-[900px] max-sm:transform-none",
        className
      )}
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div
        className="w-full h-full flex flex-col sm:transform-gpu"
        style={{
          transform: `perspective(900px) rotateX(${tiltAngle}deg)`,
          transformOrigin: "center bottom",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}
