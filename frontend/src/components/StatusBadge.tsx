"use client";

import { cn } from "@/lib/utils";

export type StatusValue =
  | "In Progress"
  | "in-progress"
  | "IN_PROGRESS"
  | "Pending"
  | "pending"
  | "PENDING"
  | "Resolved"
  | "resolved"
  | "RESOLVED"
  | "Open"
  | "open"
  | "OPEN"
  | "Rejected"
  | "rejected"
  | "REJECTED"
  | "In Progress"
  | "Planned"
  | "Proposed"
  | "Completed"
  | "Funded"
  | "FUNDED"
  | "PROPOSED"
  | "VOTING"
  | string;

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

function normalise(status: string): string {
  return status.toUpperCase().replace(/[\s-]/g, "_");
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  IN_PROGRESS: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    label: "In Progress",
  },
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Pending",
  },
  OPEN: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Open",
  },
  RESOLVED: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    label: "Resolved",
  },
  REJECTED: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    label: "Rejected",
  },
  PLANNED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    label: "Planned",
  },
  PROPOSED: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    label: "Proposed",
  },
  COMPLETED: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    label: "Completed",
  },
  FUNDED: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    label: "Funded",
  },
  VOTING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Voting",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = normalise(status);
  const config = STATUS_CONFIG[key] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold border",
        config.bg,
        config.text,
        config.border,
        className
      )}
      style={{ borderRadius: "var(--radius-pill)" }}
    >
      {config.label}
    </span>
  );
}
