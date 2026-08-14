"use client";

import React from "react";
import { MapPin, ThumbsUp, Calendar, Clock } from "lucide-react";
import { GrievanceTicket, getCategoryShortLabel, IssueStatus, IssuePriority } from "@/lib/grievance";
import { cn } from "@/lib/utils";

interface ComplaintCardProps {
  ticket: GrievanceTicket;
  onClick?: () => void;
  onUpvote?: () => void;
}

function TicketStatusBadge({ status }: { status: IssueStatus }) {
  let colorClass = "bg-slate-100 text-slate-600 border border-slate-200";
  if (status === "Resolved") {
    colorClass = "bg-green-50 text-green-700 border border-green-200";
  } else if (status === "In Progress") {
    colorClass = "bg-amber-50 text-amber-700 border border-amber-200";
  } else if (status === "Under Review") {
    colorClass = "bg-blue-50 text-blue-700 border border-blue-200";
  } else if (status === "Rejected") {
    colorClass = "bg-red-50 text-red-700 border border-red-200";
  }

  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border shrink-0", colorClass)}>
      {status}
    </span>
  );
}

export default function ComplaintCard({ ticket, onClick, onUpvote }: ComplaintCardProps) {
  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case "Critical": return "bg-red-50 text-red-700 border-red-100";
      case "High": return "bg-orange-50 text-orange-700 border-orange-100";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpvote) {
      onUpvote();
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5 text-xs font-semibold text-slate-600 transition-all hover:shadow-md hover:border-slate-200/80 cursor-pointer"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-400 tracking-wider text-[10px]">{ticket.id}</span>
          <p className="text-[10px] text-slate-400 font-medium leading-none flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("inline-block border px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide", getPriorityBadge(ticket.priority))}>
            {ticket.priority}
          </span>
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
          {ticket.title}
        </h3>
        <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">
          {ticket.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100/60 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {getCategoryShortLabel(ticket.category)}
          </span>
          
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px] font-medium">{ticket.location}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpvoteClick}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 rounded-lg text-slate-500 hover:text-amber-700 transition-all font-bold text-[10px] cursor-pointer"
        >
          <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
          <span>{ticket.upvotes || 0}</span>
        </button>
      </div>
    </div>
  );
}
