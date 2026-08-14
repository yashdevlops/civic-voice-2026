"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Loader2, CheckCircle2, AlertCircle,
  PlusCircle, List, MapPin, Camera, User, Phone, Mail, Clock, ArrowLeft
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  GrievanceTicket,
  IssueCategory,
  IssueStatus,
  IssuePriority,
  CATEGORY_OPTIONS
} from "@/lib/grievance";
import {
  getGrievances,
  addGrievance,
  migrateLegacyGrievanceData,
  GRIEVANCE_SYNC_EVENT
} from "@/lib/grievanceStore";

type Tab = "submit" | "tickets";

// ── Status badge renderer ───────────────────────────────────────────────────
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

// ── Single Ticket card renderer ──────────────────────────────────────────────
function CitizenTicketCard({ ticket }: { ticket: GrievanceTicket }) {
  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case "Critical": return "bg-red-50 text-red-700 border-red-100";
      case "High": return "bg-orange-50 text-orange-700 border-orange-100";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5 text-xs font-semibold text-slate-600">
      
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-400 tracking-wider text-[10px]">{ticket.id}</span>
          <p className="text-[10px] text-slate-400 font-medium leading-none">
            Submitted on {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
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
        <p className="text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {ticket.imageUrl && (
        <div className="relative rounded-xl overflow-hidden border border-slate-100 max-h-[140px] flex items-center justify-center bg-slate-50">
          <img src={ticket.imageUrl} alt="Attached evidence" className="max-h-[140px] w-auto object-contain" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100/60 font-semibold text-slate-500">
        <div className="flex items-start gap-1.5">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-700">{ticket.location}</p>
            {ticket.landmark && <p className="text-[10px] text-slate-400 font-medium">Landmark: {ticket.landmark}</p>}
          </div>
        </div>
        <div className="flex flex-col justify-center border-l-0 sm:border-l border-slate-200/60 pl-0 sm:pl-3 space-y-0.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold">Department</p>
          <p className="text-slate-700 font-bold">{ticket.department}</p>
        </div>
      </div>

      {/* Admin update logs */}
      {ticket.adminNotes && ticket.adminNotes.length > 0 && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Updates & Progress History</p>
          <div className="relative pl-4 border-l border-slate-200 space-y-3.5 ml-1.5">
            {ticket.adminNotes.slice().sort((a,b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()).map((note, index) => (
              <div key={index} className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 text-[9px] text-slate-400">
                  <span className="font-extrabold text-slate-700 uppercase tracking-wider">{note.status}</span>
                  <span>·</span>
                  <span>{new Date(note.changedAt).toLocaleString()}</span>
                </div>
                {note.note && (
                  <p className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-slate-600 font-medium leading-relaxed">
                    {note.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function CitizenContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Primary states
  const [activeTab, setActiveTab] = useState<Tab>("submit");
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);

  // Form input states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Roads & Potholes");
  const [priority, setPriority] = useState<IssuePriority>("Medium");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  // Auto-run migrations + load store
  useEffect(() => {
    migrateLegacyGrievanceData();
    setTickets(getGrievances());

    const refresh = () => setTickets(getGrievances());
    window.addEventListener(GRIEVANCE_SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh); // tab-sync

    return () => {
      window.removeEventListener(GRIEVANCE_SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("ticket")) {
      setActiveTab("tickets");
    }
  }, [searchParams]);

  // Derive citizen info from context
  const citizenEmail = user?.email || "guest@civicvoice.gov.in";
  const citizenName = user?.name || "Guest Citizen";
  const citizenPhone = user?.phone || undefined;

  // Filter local tickets by this citizen's email
  const myTicketsList = tickets.filter(
    (t) => t.citizenEmail.toLowerCase().trim() === citizenEmail.toLowerCase().trim()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || submitting) return;

    setSubmitting(true);
    // Simulate latency
    await new Promise((res) => setTimeout(res, 600));

    try {
      const ticket = addGrievance({
        citizenName,
        citizenEmail,
        citizenPhone,
        title: title.trim() || "Untitled Complaint",
        description: description.trim(),
        category,
        priority,
        location: location.trim() || "Unknown Location",
        landmark: landmark.trim() ? landmark.trim() : undefined,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
      });

      setSuccessTicketId(ticket.id);
      
      // Reset Form fields
      setTitle("");
      setDescription("");
      setCategory("Roads & Potholes");
      setPriority("Medium");
      setLocation("");
      setLandmark("");
      setImageUrl("");
    } catch (err: any) {
      alert(err.message || "Failed to submit grievance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 font-sans" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Page Header */}
      <div className="px-4 py-8 sm:px-6 border-b"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-4">
            <Link href={user ? "/dashboard" : "/"}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-semibold transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md">
              <ArrowLeft className="h-3.5 w-3.5" />
              {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            {t.citizenTitle}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t.citizenSubtitle}
          </p>

          <div className="mt-5 flex gap-1 p-1 w-fit"
            style={{ backgroundColor: "var(--color-bg-alt)", borderRadius: "var(--radius-control)" }}>
            <button onClick={() => setActiveTab("submit")}
              className={cn("flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "submit" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
              style={{ borderRadius: "calc(var(--radius-control) - 2px)" }}>
              <PlusCircle className="h-4 w-4" />
              {t.tabSubmit}
            </button>
            <button onClick={() => setActiveTab("tickets")}
              className={cn("flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative",
                activeTab === "tickets" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
              style={{ borderRadius: "calc(var(--radius-control) - 2px)" }}>
              <List className="h-4 w-4" />
              {t.tabMyTickets}
              {myTicketsList.length > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">
                  {myTicketsList.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        
        {/* ── Submit Tab ────────────────────────────────────────────────── */}
        {activeTab === "submit" && (
          <div className="space-y-6">
            
            {successTicketId ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center space-y-4 animate-fade-in text-xs font-semibold text-slate-700">
                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto border border-green-200 shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800">
                    Complaint Submitted Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Your issue has been logged as Ticket ID:{" "}
                    <strong className="text-slate-800 font-mono text-sm underline">{successTicketId}</strong>
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSuccessTicketId(null)}
                    className="btn-primary px-4 py-2 mx-auto justify-center"
                  >
                    File Another Complaint
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-650 text-slate-600">
                
                {/* Auto-filled details info warning */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                  <User className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-slate-750 text-slate-800 font-bold">Filing as: {citizenName}</p>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" />{citizenEmail}</span>
                      {citizenPhone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{citizenPhone}</span>}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="form-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t.formTitle}
                  </label>
                  <input
                    id="form-title"
                    type="text"
                    required
                    className="civic-input px-3"
                    placeholder="e.g. Broken street light near Jayanagar Park"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="form-description" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t.formDescription}
                  </label>
                  <textarea
                    id="form-description"
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                    required
                    placeholder={t.formDescPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Category & Priority selects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-category" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      {t.formCategory}
                    </label>
                    <select
                      id="form-category"
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="form-priority" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Priority Level
                    </label>
                    <select
                      id="form-priority"
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as IssuePriority)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Location Address */}
                <div>
                  <label htmlFor="form-location" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Location Address
                  </label>
                  <input
                    id="form-location"
                    type="text"
                    required
                    className="civic-input px-3"
                    placeholder="e.g. 3rd Cross, Jayanagar, Bengaluru"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Landmark & Photo Url */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-landmark" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Landmark (Optional)
                    </label>
                    <input
                      id="form-landmark"
                      type="text"
                      className="civic-input px-3"
                      placeholder="e.g. near Metro Pillar 42"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="form-image" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Photo URL (Optional)
                    </label>
                    <input
                      id="form-image"
                      type="url"
                      className="civic-input px-3"
                      placeholder="https://example.com/pothole.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-3 text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.formSubmitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{t.formSubmit}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── My Tickets Tab ─────────────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            {myTicketsList.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <List className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">{t.noData}</p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-4 btn-primary mx-auto"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{t.tabSubmit}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTicketsList.map((ticket) => (
                  <CitizenTicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function CitizenPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading portal…</div>}>
      <CitizenContent />
    </Suspense>
  );
}
