"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  length?: number;
}

export default function OtpInput({
  value,
  onChange,
  error = false,
  length = 6,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array
  const otpArray = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    const lastChar = val.substring(val.length - 1);
    const newOtpArray = [...otpArray];
    newOtpArray[index] = lastChar;
    const newOtp = newOtpArray.join("");
    onChange(newOtp);

    // Focus next element
    if (index < length - 1 && lastChar) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newOtpArray = [...otpArray];
      if (otpArray[index]) {
        newOtpArray[index] = "";
      } else if (index > 0) {
        newOtpArray[index - 1] = "";
        inputsRef.current[index - 1]?.focus();
      }
      onChange(newOtpArray.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split("");
    const newOtpArray = Array(length).fill("");
    digits.forEach((digit, i) => {
      newOtpArray[i] = digit;
    });

    const newOtp = newOtpArray.join("");
    onChange(newOtp);

    // Focus the last input filled or the last input
    const focusIndex = Math.min(digits.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  // Shake animation configuration
  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 },
    },
    idle: { x: 0 },
  };

  return (
    <motion.div
      variants={shakeVariants}
      animate={error ? "shake" : "idle"}
      className="flex justify-center gap-2"
    >
      {Array(length)
        .fill(0)
        .map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otpArray[i] || ""}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-12 text-center text-lg font-bold bg-white text-slate-800 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-inner",
              error
                ? "border-red-400 focus:ring-red-300"
                : otpArray[i]
                ? "border-primary"
                : "border-slate-200"
            )}
          />
        ))}
    </motion.div>
  );
}
