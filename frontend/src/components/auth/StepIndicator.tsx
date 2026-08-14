"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number; // 0-indexed: 0, 1, 2, 3
  steps?: string[];
}

export default function StepIndicator({
  currentStep,
  steps = ["Code", "Identity", "Password", "Review"],
}: StepIndicatorProps) {
  return (
    <div className="w-full py-4 select-none">
      <div className="flex items-center justify-between w-full relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        
        {/* Progress line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-amber-600 -translate-y-1/2 transition-all duration-300 z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          
          return (
            <div key={index} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2",
                  isCompleted
                    ? "bg-amber-600 border-amber-600 text-white"
                    : isActive
                    ? "bg-white border-amber-600 text-amber-700 shadow-md scale-110"
                    : "bg-white border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3px]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold mt-1.5 uppercase tracking-wider transition-colors duration-300",
                  isActive ? "text-amber-700 font-extrabold" : "text-slate-400"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
