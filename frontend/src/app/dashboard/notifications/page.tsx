"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Info, Vote, Leaf, CheckCircle2, ChevronRight, ArrowUpRight } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const [filterType, setFilterType] = useState("All");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    // Mock action
    alert("All notifications marked as read!");
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "All") return true;
    if (filterType === "Updates") return n.type === "update";
    if (filterType === "Votes") return n.type === "vote";
    if (filterType === "Reminders") return n.type === "reminder";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">
            Notifications
          </h1>
          <p className="text-xs text-slate-500">Stay updated on the status of reports and public votes</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Filter selector */}
          <select
            className="text-xs text-slate-600 bg-white border border-slate-200 rounded-control px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Notifications</option>
            <option value="Updates">Updates</option>
            <option value="Votes">Votes</option>
            <option value="Reminders">Reminders</option>
          </select>

          <button 
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Feed list */}
      <div className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden divide-y divide-slate-50">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No new notifications in this category.</p>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => {
            // Determine icons and colors based on notification type
            let IconComponent = Info;
            let iconBg = "bg-blue-50 text-blue-600 border-blue-200";
            
            if (notif.type === "update") {
              IconComponent = Info;
              iconBg = "bg-blue-50 text-blue-600 border-blue-100";
            } else if (notif.type === "vote") {
              IconComponent = Vote;
              iconBg = "bg-amber-50 text-amber-600 border-amber-100";
            } else if (notif.type === "reminder") {
              IconComponent = Leaf;
              iconBg = "bg-green-50 text-green-600 border-green-100";
            }

            return (
              <div 
                key={notif.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Colored icon wrapper */}
                  <span className={cn("h-9 w-9 rounded-full flex items-center justify-center border shrink-0", iconBg)}>
                    <IconComponent className="h-4.5 w-4.5" />
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800 leading-normal">
                      {notif.text}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>

                {/* Optional Deep-link target action */}
                {notif.linkTo ? (
                  <Link 
                    href={notif.linkTo} 
                    className="p-1.5 rounded-control hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors shrink-0"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </Link>
                ) : (
                  <span className="w-8 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="text-center pt-4">
        <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-primary flex items-center justify-center gap-1">
          View All Notifications
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
