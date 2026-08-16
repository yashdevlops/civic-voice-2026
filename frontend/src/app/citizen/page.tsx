"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Loader2, CheckCircle2, AlertCircle,
  PlusCircle, List, User, Phone, Mail, ArrowLeft
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  GrievanceTicket,
  IssueCategory,
  IssuePriority,
  CATEGORY_OPTIONS
} from "@/lib/grievance";
import {
  getGrievancesByCitizenEmail,
  addGrievance,
  upvoteGrievance,
  migrateLegacyGrievanceData,
  GRIEVANCE_SYNC_EVENT
} from "@/lib/grievanceStore";
import { notifyComplaintSubmitted } from "@/lib/notificationStore";
import ComplaintCard from "@/components/citizen/ComplaintCard";

type Tab = "submit" | "tickets";

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

  // Derive citizen info from context
  const citizenEmail = user?.email || "guest@civicvoice.gov.in";
  const citizenName = user?.name || "Guest Citizen";
  const citizenPhone = user?.phone || undefined;

  // Auto-run migrations + load store with Sync hook (§8 pattern)
  useEffect(() => {
    migrateLegacyGrievanceData();
    setTickets(getGrievancesByCitizenEmail(citizenEmail));

    const refresh = () => {
      setTickets(getGrievancesByCitizenEmail(citizenEmail));
    };
    window.addEventListener(GRIEVANCE_SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh); // tab-sync

    return () => {
      window.removeEventListener(GRIEVANCE_SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [citizenEmail]);

  useEffect(() => {
    if (searchParams.get("ticket")) {
      setActiveTab("tickets");
    }
  }, [searchParams]);

  // Log debug count
  console.log("[citizen] my tickets count:", tickets.length);

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

      // Dispatch real notification event
      notifyComplaintSubmitted({ id: ticket.id, title: ticket.title });

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

  const handleUpvote = (id: string) => {
    upvoteGrievance(id);
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
              {tickets.length > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">
                  {tickets.length}
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
                    onClick={() => {
                      setSuccessTicketId(null);
                      setActiveTab("tickets");
                    }}
                    className="btn-primary px-4 py-2 mx-auto justify-center"
                  >
                    View My Tickets
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-600">
                
                {/* Auto-filled details info warning */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                  <User className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-slate-800 font-bold">Filing as: {citizenName}</p>
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
                    className="civic-input px-4"
                    placeholder="e.g. Broken streetlight near Jayanagar Park"
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
                    className="civic-input px-4"
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
                      className="civic-input px-4"
                      placeholder="e.g. near Metro Pillar 42"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Upload Photo (Optional)
                    </label>
                    {imageUrl ? (
                      <div className="relative rounded-lg border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt="Evidence Preview"
                          className="h-14 w-14 object-cover rounded-md border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">Photo Attached</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Ready for upload</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove Photo"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-lg p-3 text-center transition-colors bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer">
                        <input
                          id="form-image"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              alert("File size exceeds 5MB limit. Please choose a smaller image.");
                              return;
                            }
                            if (!file.type.startsWith("image/")) {
                              alert("Please select a valid image file.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === "string") {
                                setImageUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <PlusCircle className="h-5 w-5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">
                            Click or drag photo here
                          </span>
                          <span className="text-[10px] text-slate-400">
                            JPG, PNG, WEBP up to 5MB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-3 text-base cursor-pointer"
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
            {tickets.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <List className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">{t.noData}</p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-4 btn-primary mx-auto cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{t.tabSubmit}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <ComplaintCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onUpvote={() => handleUpvote(ticket.id)}
                  />
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
