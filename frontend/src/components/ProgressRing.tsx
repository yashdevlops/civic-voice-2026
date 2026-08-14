"use client";

interface ProgressRingProps {
  value: number; // 0–100
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: boolean;
  className?: string;
}

export default function ProgressRing({
  value,
  size = 56,
  strokeWidth = 5,
  color = "#2E7D32",
  trackColor = "#E2E8F0",
  label = true,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      {label && (
        <span
          className="absolute text-xs font-bold text-slate-700 tabular-nums"
          style={{ fontSize: size < 48 ? "9px" : "11px" }}
        >
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
