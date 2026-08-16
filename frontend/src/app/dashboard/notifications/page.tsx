"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Info, Vote, Leaf, ChevronRight, ArrowUpRight, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getRelativeTimeString,
  MASTER_NOTIF_SYNC_EVENT,
  CivicNotification,
} from "@/lib/notificationStore";

export default function Notifications() {
  const [filterType, setFilterType] = useState("All");
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());

    const refresh = () => setNotifications(getNotifications());
    window.addEventListener(MASTER_NOTIF_SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(MASTER_NOTIF_SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleNotifClick = (id: string) => {
    markAsRead(id);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "All") return true;
    if (filterType === "Updates") return n.type === "complaint_status" || n.iconType === "info";
    if (filterType === "Votes") return n.type === "vote_counted" || n.type === "quarter_round" || n.iconType === "vote";
    if (filterType === "Reminders") return n.type === "assembly" || n.iconType === "leaf";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-extrabold bg-primary text-white px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">Stay updated on the status of reports and public votes</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Filter selector */}
          <select
            className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-control px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Notifications</option>
            <option value="Updates">Updates</option>
            <option value="Votes">Votes</option>
            <option value="Reminders">Reminders</option>
          </select>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Feed list */}
      <div className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden divide-y divide-slate-50">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm font-semibold">No notifications in this category.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            let IconComponent = Info;
            let iconBg = "bg-blue-50 text-blue-600 border-blue-200";

            if (notif.iconType === "vote" || notif.type === "vote_counted" || notif.type === "quarter_round") {
              IconComponent = Vote;
              iconBg = "bg-amber-50 text-amber-600 border-amber-100";
            } else if (notif.iconType === "leaf" || notif.type === "assembly") {
              IconComponent = Leaf;
              iconBg = "bg-green-50 text-green-600 border-green-100";
            } else {
              IconComponent = Info;
              iconBg = "bg-blue-50 text-blue-600 border-blue-100";
            }

            const relativeTime = getRelativeTimeString(notif.timestamp);
            const displayText = notif.message || notif.title;
            const targetLink = notif.type === "vote_counted" || notif.type === "quarter_round" 
              ? "/dashboard/budget-proposals" 
              : "/dashboard/complaints";

            return (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif.id)}
                className={cn(
                  "p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer",
                  !notif.read ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-slate-50/50"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={cn("h-9 w-9 rounded-full flex items-center justify-center border shrink-0 relative", iconBg)}>
                    <IconComponent className="h-4.5 w-4.5" />
                    {!notif.read && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white" />
                    )}
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs leading-normal", !notif.read ? "font-extrabold text-slate-900" : "font-semibold text-slate-700")}>
                        {notif.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-snug">
                      {displayText}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {relativeTime}
                    </span>
                  </div>
                </div>

                <Link
                  href={targetLink}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotifClick(notif.id);
                  }}
                  className="p-1.5 rounded-control hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors shrink-0"
                  title="Open related details"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="text-center pt-2">
        <span className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
          Showing real-time civic activity feed
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
