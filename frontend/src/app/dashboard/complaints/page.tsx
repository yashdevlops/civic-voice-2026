"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, Filter, ArrowUpDown, ChevronRight, Plus,
  MapPin, ChevronLeft, Calendar, Clock, WifiOff, AlertCircle, ThumbsUp
} from "lucide-react";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { loadQueue, type PendingSubmission } from "@/lib/offline-queue";
import { loadUserTickets, type LocalTicket } from "@/lib/user-tickets";
import { useLiveTimestamp } from "@/lib/useLiveTimestamp";

// ── Pending complaint row ─────────────────────────────────────────────────────

function PendingRow({ item }: { item: PendingSubmission }) {
  const isGivenUp = item.status === "failed";
  const label = item.payload.title || item.payload.description.slice(0, 55) || "Untitled complaint";
  return (
    <div className={cn(
      "rounded-card border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4",
      isGivenUp
        ? "border-l-red-400 bg-red-50 border-red-200"
        : "border-l-amber-400 bg-amber-50 border-amber-200"
    )}>
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className={cn(
          "h-16 w-16 rounded-control shrink-0 flex items-center justify-center font-bold text-xs shadow-inner",
          isGivenUp ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"
        )}>
          <WifiOff className="h-6 w-6" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">{item.localId}</span>
            {item.payload.category && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-slate-100 text-slate-600 border border-slate-200">
                {item.payload.category}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-800 truncate leading-snug">{label}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{item.payload.location.text || "Location not set"}</span>
          </p>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-amber-100">
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-pill",
          isGivenUp ? "bg-red-100 text-red-700 border border-red-200" : "bg-amber-100 text-amber-700 border border-amber-200"
        )}>
          {isGivenUp ? "Sync Failed" : "Pending Sync"}
        </span>
        <div className="flex items-center gap-1 mt-1 text-slate-400 text-[11px] font-semibold">
          <Calendar className="h-3 w-3" />
          <span>{new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}

// ── Local confirmed ticket row ────────────────────────────────────────────────

function LocalTicketRow({ ticket }: { ticket: LocalTicket }) {
  const timestamp = useLiveTimestamp(ticket.created_at);
  return (
    <div className="bg-white rounded-card border border-primary/30 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-primary">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="h-16 w-16 rounded-control shrink-0 flex items-center justify-center border border-slate-100 bg-primary-tint font-bold text-primary text-xs shadow-inner">
          📋
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">{ticket.id}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-slate-100 text-slate-600 border border-slate-200">
              {ticket.category}
            </span>
            {ticket.upvote_count > 1 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                <ThumbsUp className="h-2.5 w-2.5" /> {ticket.upvote_count}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-800 truncate leading-snug">
            {ticket.title || ticket.description.slice(0, 60)}
          </h3>
          {ticket.address && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{ticket.address}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
        <StatusBadge status={ticket.status} />
        <div className="flex items-center gap-1 mt-1 text-slate-400 text-[11px] font-semibold">
          <Calendar className="h-3 w-3" />
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}

// ── Seed/demo complaint row ───────────────────────────────────────────────────

function SeedComplaintRow({ c, isDemo }: { c: (typeof MOCK_COMPLAINTS)[number]; isDemo?: boolean }) {
  const timestamp = useLiveTimestamp(c.created_at);
  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-sm p-4 hover:shadow-card-lg transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-primary">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="h-16 w-16 rounded-control shrink-0 flex items-center justify-center border border-slate-100 font-bold text-slate-700 text-xs shadow-inner" style={{ backgroundColor: c.thumbnailColor }}>
          📸 Issue
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">{c.id}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-slate-100 text-slate-600 border border-slate-200">{c.category}</span>
            {c.upvote_count > 1 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                <ThumbsUp className="h-2.5 w-2.5" /> {c.upvote_count}
              </span>
            )}
            {isDemo && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">Demo</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-800 truncate leading-snug">{c.title}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{c.location}</span>
          </p>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
        <StatusBadge status={c.status} />
        <div className="flex items-center gap-1 mt-1 text-slate-400 text-[11px] font-semibold">
          <Calendar className="h-3 w-3" />
          <span>{timestamp}</span>
        </div>
      </div>
      <div className="hidden sm:block text-slate-300 hover:text-slate-500 cursor-pointer">
        <ChevronRight className="h-5 w-5" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyComplaints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [pendingItems, setPendingItems] = useState<PendingSubmission[]>([]);
  const [localTickets, setLocalTickets] = useState<LocalTicket[]>([]);

  useEffect(() => {
    setPendingItems(loadQueue());
    setLocalTickets(loadUserTickets());
  }, []);

  // ── Three-source merge with dedup by ID ────────────────────────────────
  // 1. Pending (no server ID yet)
  // 2. Local confirmed tickets (server IDs)
  // 3. Seed/mock — exclude IDs already in local tickets
  const localTicketIds = new Set(localTickets.map((t) => t.id));
  const dedupedSeedComplaints = MOCK_COMPLAINTS.filter((c) => !localTicketIds.has(c.id));

  // Apply search + status filters per source
  const filteredPending = pendingItems.filter((item) => {
    if (statusFilter !== "All") return false; // pending has no server status
    const label = `${item.payload.title} ${item.payload.description} ${item.payload.location.text}`.toLowerCase();
    return !searchTerm || label.includes(searchTerm.toLowerCase());
  });

  const filteredLocal = localTickets.filter((t) => {
    const matchesSearch = !searchTerm || `${t.title} ${t.description} ${t.address ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status.toLowerCase().replace("_", " ") === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredSeed = dedupedSeedComplaints.filter((c) => {
    const matchesSearch = !searchTerm || `${c.id} ${c.title} ${c.location}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalShown = filteredPending.length + filteredLocal.length + filteredSeed.length;
  const hasPending = pendingItems.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">My Complaints</h1>
          <p className="text-xs text-slate-500">Track and manage your submitted civic complaints</p>
        </div>
        <Link href="/citizen" className="btn-primary flex items-center justify-center gap-1.5 self-start md:self-auto">
          <Plus className="h-4.5 w-4.5" />
          <span>+ New Complaint</span>
        </Link>
      </div>

      {/* Pending sync banner */}
      {hasPending && (
        <div className="flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              {pendingItems.length} complaint{pendingItems.length !== 1 ? "s" : ""} pending server sync
            </p>
            <p className="text-xs text-amber-700">
              Stored locally — will sync when the server is reachable. Do not clear browser data until they show a confirmed ticket ID.
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-card border border-slate-100 shadow-sm">
        <div className="flex-1 min-w-0 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Search complaint ID, title, or location..."
            className="w-full bg-slate-50 ps-10 pe-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-control focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-400"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />Status:
          </span>
          <select className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-control px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />Sort:
          </span>
          <select className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-control px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {/* 1. Pending items — always first, amber */}
        {filteredPending.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Sync</span>
            </div>
            {filteredPending.map((item) => <PendingRow key={item.localId} item={item} />)}
          </div>
        )}

        {/* 2. User's own confirmed tickets — primary border */}
        {filteredLocal.length > 0 && (
          <div className="space-y-3">
            {filteredPending.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Your Confirmed Tickets</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            )}
            {filteredLocal.map((t) => <LocalTicketRow key={t.id} ticket={t} />)}
          </div>
        )}

        {/* 3. Seed/demo data — de-emphasised with Demo badge */}
        {filteredSeed.length > 0 && (
          <div className="space-y-3">
            {(filteredPending.length > 0 || filteredLocal.length > 0) && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Demo Data</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            )}
            {filteredSeed.map((c, idx) => <SeedComplaintRow key={c.id ?? idx} c={c} isDemo />)}
          </div>
        )}

        {totalShown === 0 && (
          <div className="bg-white rounded-card border border-slate-100 shadow-sm p-12 text-center">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No complaints found matching the criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
        <span>Showing {totalShown} complaint{totalShown !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1.5">
          <button className="p-2 border border-slate-200 rounded-control bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50" disabled>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button className="h-8 w-8 rounded-pill flex items-center justify-center bg-primary text-white font-bold shadow-sm">1</button>
          <button className="p-2 border border-slate-200 rounded-control bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50" disabled>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
