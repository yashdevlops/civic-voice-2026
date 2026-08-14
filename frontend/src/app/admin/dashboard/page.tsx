"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Loader2, UserCheck, AlertTriangle, Clock, CheckCircle, ListTodo } from "lucide-react";
import { ADMIN_SESSION_KEY, findOfficerByEmail, logoutAdmin } from "@/lib/officerRegistry";
import { OfficerUser, OfficerSession } from "@/lib/types";

// Grievance imports
import { GrievanceTicket, IssueStatus, IssuePriority } from "@/lib/grievance";
import { getGrievances, computeStats, updateGrievanceStatus, GRIEVANCE_SYNC_EVENT, GRIEVANCE_STORE_KEY } from "@/lib/grievanceStore";
import StatCard from "@/components/admin/StatCard";
import GrievanceQueue from "@/components/admin/GrievanceQueue";
import GrievanceDetailModal from "@/components/admin/GrievanceDetailModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [officer, setOfficer] = useState<OfficerUser | null>(null);

  // Live grievance sync state
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All"); // Default status filter is "All"
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Modal target state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Session verification effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!savedSessionStr) {
      router.replace("/admin/login");
      return;
    }

    try {
      const session = JSON.parse(savedSessionStr) as OfficerSession & { officialEmail: string };
      
      // Check session expiry
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        router.replace("/admin/login");
        return;
      }

      // Look up officer fresh from registry by email
      const record = findOfficerByEmail(session.officialEmail);
      if (!record) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        router.replace("/admin/login");
        return;
      }

      setOfficer(record);
      setTickets(getGrievances());
      setLoading(false);
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      router.replace("/admin/login");
    }
  }, [router]);

  // Sync / reload callback
  const reloadTickets = useCallback(() => {
    setTickets(getGrievances());
  }, []);

  // Real-time synchronization listeners
  useEffect(() => {
    if (loading || !officer) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GRIEVANCE_STORE_KEY || !e.key) {
        reloadTickets();
      }
    };

    window.addEventListener(GRIEVANCE_SYNC_EVENT, reloadTickets);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(GRIEVANCE_SYNC_EVENT, reloadTickets);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loading, officer, reloadTickets]);

  // Live lookup: header always fetches freshest info on render
  const currentOfficerInfo = officer ? findOfficerByEmail(officer.officialEmail) || officer : null;

  const handleLogout = () => {
    logoutAdmin();
    router.replace("/admin/login");
  };

  const handleQueueStatusChange = (id: string, newStatus: IssueStatus) => {
    if (!currentOfficerInfo) return;
    updateGrievanceStatus(
      id,
      newStatus,
      "Status updated directly from dashboard queue selector",
      currentOfficerInfo.officerId
    );
  };

  // Live client-side grievance filtering logic (Search Term AND Status AND Priority)
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" ? true : t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate live stats
  const stats = computeStats(tickets);

  if (loading || !currentOfficerInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-2" />
        <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Verifying credentials…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                <ShieldCheck className="text-amber-600 h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-800 tracking-tight font-display">
                  CivicVoice Portal
                </span>
                <span className="block text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-none">
                  Municipal Administration
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Welcome Banner Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-slate-800 font-display flex items-center gap-2">
              Welcome, {currentOfficerInfo.name}
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            </h1>
            
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md font-bold text-slate-700">
                🏛️ Central Municipal Administration
              </span>
              <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md text-amber-700 font-semibold uppercase tracking-wider text-[9px]">
                <UserCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>{currentOfficerInfo.role.toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-semibold border-l-0 md:border-l border-slate-200 pl-0 md:pl-6 py-1">
            <p>Officer ID: <span className="font-mono text-slate-700 font-bold">{currentOfficerInfo.officerId}</span></p>
            <p>Mail: <span className="font-mono text-slate-700 font-bold">{currentOfficerInfo.officialEmail}</span></p>
          </div>
        </div>

        {/* Live Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints Logged"
            value={stats.total}
            icon={<ListTodo className="h-4.5 w-4.5 text-slate-500" />}
          />
          <StatCard
            title="Critical Priority Hotspots"
            value={stats.critical}
            icon={<AlertTriangle className="h-4.5 w-4.5 text-red-500" />}
            trendType="up"
            trend="+12%"
          />
          <StatCard
            title="In Progress Actions"
            value={stats.inProgress}
            icon={<Clock className="h-4.5 w-4.5 text-amber-500" />}
          />
          <StatCard
            title="Successfully Resolved"
            value={stats.resolved}
            icon={<CheckCircle className="h-4.5 w-4.5 text-emerald-500" />}
            trendType="down"
            trend="-3%"
          />
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 text-xs font-semibold text-slate-600">
            {/* Search Input */}
            <div className="flex-grow">
              <label htmlFor="search-input" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Search Grievances
              </label>
              <input
                id="search-input"
                type="text"
                placeholder="Search by ID, Title, Citizen, or Location..."
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <label htmlFor="status-filter" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Filter Status
              </label>
              <select
                id="status-filter"
                className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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

            {/* Priority Filter */}
            <div className="w-full md:w-48">
              <label htmlFor="priority-filter" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Filter Priority
              </label>
              <select
                id="priority-filter"
                className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grievance Table Queue */}
        <GrievanceQueue
          tickets={filteredTickets}
          onViewDetails={(ticket) => setActiveTicketId(ticket.id)}
          onStatusChange={handleQueueStatusChange}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400 mt-auto">
        <p>© {new Date().getFullYear()} CivicVoice. Authorized Municipal Administration Space.</p>
      </footer>

      {/* Grievance Detail Modal */}
      {activeTicketId && (
        <GrievanceDetailModal
          isOpen={activeTicketId !== null}
          onClose={() => setActiveTicketId(null)}
          ticketId={activeTicketId}
          currentOfficerId={currentOfficerInfo.officerId}
        />
      )}
    </div>
  );
}
