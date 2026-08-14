"use client";

import React from "react";
import { GrievanceTicket, IssueStatus, IssuePriority } from "@/lib/grievance";
import StatusSelector from "./StatusSelector";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface GrievanceQueueProps {
  tickets: GrievanceTicket[];
  onViewDetails: (ticket: GrievanceTicket) => void;
  onStatusChange: (id: string, status: IssueStatus) => void;
}

export default function GrievanceQueue({
  tickets,
  onViewDetails,
  onStatusChange,
}: GrievanceQueueProps) {
  
  // Color-coded priority badges helper
  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-700 tracking-tight">
              No grievances match your filters
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Try adjusting your search queries or selecting different status/priority options.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Complaint Details</th>
              <th className="py-3 px-4">Citizen</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                {/* ID */}
                <td className="py-4 px-4 font-mono font-bold text-slate-700">
                  {t.id}
                </td>
                
                {/* Title + Category */}
                <td className="py-4 px-4 max-w-[240px]">
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-800 truncate" title={t.title}>
                      {t.title}
                    </p>
                    <span className="inline-block text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                </td>

                {/* Citizen */}
                <td className="py-4 px-4 text-slate-700 truncate max-w-[120px]" title={t.citizenName}>
                  {t.citizenName}
                </td>

                {/* Location */}
                <td className="py-4 px-4 text-slate-500 truncate max-w-[180px]" title={t.location}>
                  {t.location}
                </td>

                {/* Priority */}
                <td className="py-4 px-4">
                  <span className={cn("inline-block border px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider", getPriorityBadge(t.priority))}>
                    {t.priority}
                  </span>
                </td>

                {/* Status selector */}
                <td className="py-4 px-4">
                  <StatusSelector
                    currentStatus={t.status}
                    onChange={(status) => onStatusChange(t.id, status)}
                  />
                </td>

                {/* View Details */}
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onViewDetails(t)}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-control text-[11px] font-extrabold bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-100 hover:border-amber-200 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Stacked Cards */}
      <div className="md:hidden space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
            
            <div className="flex justify-between items-start">
              <span className="font-mono font-bold text-slate-700 text-xs">{t.id}</span>
              <span className={cn("inline-block border px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider", getPriorityBadge(t.priority))}>
                {t.priority}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-sm leading-tight leading-snug">
                {t.title}
              </h3>
              <div className="flex gap-2">
                <span className="inline-block text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                  {t.category}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 rounded-xl p-2.5 font-medium">
              <p><span className="font-bold text-slate-700">Citizen:</span> {t.citizenName}</p>
              <p><span className="font-bold text-slate-700">Locality:</span> {t.location}</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="w-1/2">
                <StatusSelector
                  currentStatus={t.status}
                  onChange={(status) => onStatusChange(t.id, status)}
                />
              </div>
              <button
                onClick={() => onViewDetails(t)}
                className="w-1/2 inline-flex items-center justify-center py-2 rounded-control text-xs font-bold bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-100 hover:border-amber-200 transition-colors"
              >
                View Details
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
