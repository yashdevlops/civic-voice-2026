"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "@/lib/types";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showStrengthMeter?: boolean;
  error?: FieldError;
  id: string;
  
  // Legacy compatibility props for citizen pages
  showStrength?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export interface RuleStatus {
  hasMinLen: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number;
}

export function getPasswordRuleStatus(password: string): RuleStatus {
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLen) score += 1;
  if (hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  return { hasMinLen, hasUpper, hasNumber, hasSpecial, score };
}

export default function PasswordField({
  label,
  value,
  onChange,
  showStrengthMeter = false,
  error = null,
  id,
  showStrength = false,
  required = false,
  disabled = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const { hasMinLen, hasUpper, hasNumber, hasSpecial, score } = getPasswordRuleStatus(value);

  const displayStrength = showStrengthMeter || showStrength;

  // Strength coloring helper
  const getStrengthColor = (segmentIndex: number) => {
    if (score < segmentIndex) return "bg-slate-100";
    if (score <= 2) return "bg-red-500";
    if (score === 3) return "bg-amber-500";
    return "bg-green-600";
  };

  const getStrengthText = () => {
    if (!value) return "None";
    if (score <= 2) return "Weak";
    if (score === 3) return "Medium";
    return "Strong";
  };

  const getStrengthTextColor = () => {
    if (!value) return "text-slate-400";
    if (score <= 2) return "text-red-500";
    if (score === 3) return "text-amber-500";
    return "text-green-600";
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <Lock className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none z-10" />
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          placeholder="••••••••"
          required={required}
          disabled={disabled}
          className={cn(
            "civic-input pl-11 pr-11 w-full",
            error ? "border-red-300 focus:ring-red-400" : ""
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 text-slate-400 hover:text-slate-600 z-10 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 font-bold" role="alert">
          {error}
        </p>
      )}

      {displayStrength && value && (
        <div className="space-y-3 pt-1">
          {/* 4-segment Strength Bar */}
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              <div className={cn("h-full rounded-full transition-colors duration-300", getStrengthColor(1))} />
              <div className={cn("h-full rounded-full transition-colors duration-300", getStrengthColor(2))} />
              <div className={cn("h-full rounded-full transition-colors duration-300", getStrengthColor(3))} />
              <div className={cn("h-full rounded-full transition-colors duration-300", getStrengthColor(4))} />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className={getStrengthTextColor()}>Strength: {getStrengthText()}</span>
              <span className="text-slate-400">Rule checklist</span>
            </div>
          </div>

          {/* Checklist rules */}
          <div className="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl bg-slate-50/50 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                hasMinLen ? "border-green-600 bg-green-50 text-green-600" : "border-slate-200 text-slate-300"
              )}>
                <Check className="h-2.5 w-2.5 stroke-[3px]" />
              </div>
              <span className={hasMinLen ? "text-green-700" : "text-slate-400"}>At least 8 chars</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                hasUpper ? "border-green-600 bg-green-50 text-green-600" : "border-slate-200 text-slate-300"
              )}>
                <Check className="h-2.5 w-2.5 stroke-[3px]" />
              </div>
              <span className={hasUpper ? "text-green-700" : "text-slate-400"}>1 Uppercase letter</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                hasNumber ? "border-green-600 bg-green-50 text-green-600" : "border-slate-200 text-slate-300"
              )}>
                <Check className="h-2.5 w-2.5 stroke-[3px]" />
              </div>
              <span className={hasNumber ? "text-green-700" : "text-slate-400"}>1 Number/Digit</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                hasSpecial ? "border-green-600 bg-green-50 text-green-600" : "border-slate-200 text-slate-300"
              )}>
                <Check className="h-2.5 w-2.5 stroke-[3px]" />
              </div>
              <span className={hasSpecial ? "text-green-700" : "text-slate-400"}>1 Special symbol</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
