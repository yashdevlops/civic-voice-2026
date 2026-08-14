"use client";

import React from "react";
import { IssueStatus, STATUS_ORDER } from "@/lib/grievance";
import { cn } from "@/lib/utils";

interface StatusSelectorProps {
  currentStatus: IssueStatus;
  onChange: (newStatus: IssueStatus) => void;
  disabled?: boolean;
}

export default function StatusSelector({
  currentStatus,
  onChange,
  disabled = false,
}: StatusSelectorProps) {
  // Styling based on status selection
  const getStatusStyle = (status: IssueStatus) => {
    switch (status) {
      case "Pending":
        return "bg-slate-100 border-slate-300 text-slate-700 focus:ring-slate-400";
      case "Under Review":
        return "bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-400";
      case "In Progress":
        return "bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-400";
      case "Resolved":
        return "bg-green-50 border-green-200 text-green-700 focus:ring-green-400";
      case "Rejected":
        return "bg-red-50 border-red-200 text-red-700 focus:ring-red-400";
      default:
        return "bg-slate-50 border-slate-200 text-slate-600";
    }
  };

  return (
    <div className="relative inline-block w-full min-w-[120px]">
      <select
        value={currentStatus}
        onChange={(e) => onChange(e.target.value as IssueStatus)}
        disabled={disabled}
        className={cn(
          "w-full text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg border focus:outline-none focus:ring-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed appearance-none",
          getStatusStyle(currentStatus)
        )}
      >
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status} className="bg-white text-slate-800 font-semibold">
            {status}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-current">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
