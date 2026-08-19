"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, Plus, WifiOff, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  GrievanceTicket,
  IssueStatus
} from "@/lib/grievance";
import {
  getComputedTickets,
  supportExistingTicket,
  verifyResolution,
  GRIEVANCE_SYNC_EVENT,
  GRIEVANCE_STORE_KEY
} from "@/lib/grievanceStore";
import ComplaintCard from "@/components/citizen/ComplaintCard";

type SortOption = "newest" | "oldest" | "upvotes";

function ComplaintsContent() {
  const { user } = useAuth();
  const router = useRouter();

  // If not logged in, default to guest credentials or redirect
  const currentCitizenEmail = user?.email || "guest@civicvoice.gov.in";

  // States
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);

  // Sync effect
  useEffect(() => {
    setTickets(getComputedTickets());
    setLoading(false);

    const refresh = () => {
      setTickets(getComputedTickets());
    };

    window.addEventListener(GRIEVANCE_SYNC_EVENT, refresh);
    window.addEventListener("storage", (e) => {
      if (e.key === GRIEVANCE_STORE_KEY || !e.key) {
        refresh();
      }
    });

    return () => {
      window.removeEventListener(GRIEVANCE_SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleUpvote = (id: string) => {
    supportExistingTicket(id, user?.id || "cit-guest");
    setTickets(getComputedTickets());
  };

  // Filter & Search logic
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.addressText && t.addressText.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" ? true : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "upvotes") {
      return (b.upvoteCount || 0) - (a.upvoteCount || 0);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 font-display">
            My Complaints
          </h1>
          <p className="text-xs text-slate-400">
            Track, upvote, and monitor status updates for issues you reported.
          </p>
        </div>

        <Link
          href="/citizen"
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 text-xs font-semibold text-slate-650 text-slate-650">
          
          {/* Search bar */}
          <div className="flex-grow relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, title, or location..."
              className="w-full text-xs font-semibold border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter dropdown */}
          <div className="w-full sm:w-44 flex items-center gap-1">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort selection dropdown */}
          <div className="w-full sm:w-44 flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid List rendering */}
      {sortedTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto opacity-30" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">No complaints found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or file a new ticket.</p>
          </div>
          <Link
            href="/citizen"
            className="mt-4 btn-primary mx-auto w-fit text-xs px-4 py-2"
          >
            <Plus className="h-4 w-4" />
            <span>File a complaint</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTickets.map((ticket) => (
            <ComplaintCard
              key={ticket.id}
              ticket={ticket}
              onUpvote={() => handleUpvote(ticket.id)}
              onVerifyResolution={(action, reason) => {
                verifyResolution(ticket.id, action, reason);
                setTickets(getComputedTickets());
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading complaints...</div>}>
      <ComplaintsContent />
    </Suspense>
  );
}
