"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Loader2, CheckCircle2, AlertCircle, PlusCircle, List, User, Phone, Mail,
  ArrowLeft, MapPin, Sparkles, ThumbsUp, Eye, ShieldAlert, Building2, Upload
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  GrievanceTicket,
  MunicipalDeptCode,
  MUNICIPAL_DEPARTMENTS,
  PriorityLevel,
  getCategoryIcon,
} from "@/lib/grievance";
import {
  getGrievances,
  addTicket,
  supportExistingTicket,
  verifyResolution,
  GRIEVANCE_SYNC_EVENT,
  seedGrievancesIfEmpty,
} from "@/lib/grievanceStore";
import AudioVoiceRecorder from "@/components/citizen/AudioVoiceRecorder";
import { detectWard } from "@/lib/wardDetection";
import ComplaintCard from "@/components/citizen/ComplaintCard";
import EmergencyBroadcastBanner from "@/components/dashboard/EmergencyBroadcastBanner";

type Tab = "submit" | "tickets";

// ── AI Text Heuristic for Category & Priority ─────────────────────────────────

function inferDeptAndPriority(text: string): { dept: MunicipalDeptCode; priority: PriorityLevel } | null {
  const t = text.toLowerCase();
  if (/pothole|road|asphalt|pavement|tar|repair.*road|road.*repair|speed.*bump/i.test(t)) {
    return { dept: "roads_potholes", priority: "HIGH" };
  }
  if (/water|pipe|leak|burst|supply|drainag|sewage|drain|flooding|waterlog/i.test(t)) {
    return { dept: "water_supply", priority: "CRITICAL" };
  }
  if (/garbage|trash|waste|dirty|clean|littering|sanitation|bin|dump/i.test(t)) {
    return { dept: "cleanliness", priority: "MEDIUM" };
  }
  if (/light|street.*lamp|lamp.*post|electricity|dark|blackout|power/i.test(t)) {
    return { dept: "street_lights", priority: "MEDIUM" };
  }
  if (/crime|theft|unsafe|danger|police|encroach|hazard/i.test(t)) {
    return { dept: "public_safety", priority: "HIGH" };
  }
  if (/park|tree|garden|playground|bench|swing|recreation|branch/i.test(t)) {
    return { dept: "parks_recreation", priority: "LOW" };
  }
  return null;
}

// ── Validation Hygiene ────────────────────────────────────────────────────────

interface ValidationErrors {
  title?: string;
  description?: string;
  location?: string;
}

function validateForm(title: string, description: string, location: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (title.trim().length < 8) {
    errors.title = "Title must be at least 8 characters long.";
  } else if (/^(.)\1+$/.test(title.trim())) {
    errors.title = "Please provide a valid, descriptive title.";
  }

  if (description.trim().length < 20) {
    errors.description = "Please provide at least 20 characters of detailed description.";
  }

  if (location.trim().length < 6) {
    errors.location = "Please enter a specific address or landmark (at least 6 characters).";
  }

  return errors;
}

// ── Duplicate Interceptor Modal ───────────────────────────────────────────────

function DuplicateInterceptorModal({
  existingTicket,
  onSupport,
  onForceNew,
  onClose,
}: {
  existingTicket: GrievanceTicket;
  onSupport: () => void;
  onForceNew: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-amber-400">
          <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Similar Issue Active Nearby</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Duplicate Interceptor Guard</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          A similar open report (<strong className="text-white">&quot;{existingTicket.title}&quot;</strong>) is already active in{" "}
          <strong className="text-emerald-400">{existingTicket.wardId}</strong> with{" "}
          <strong className="text-amber-400 font-bold">{existingTicket.upvoteCount} supporters</strong>.
          Would you like to support this existing report instead of creating a duplicate ticket?
        </p>

        <div className="bg-slate-850 border border-slate-700 rounded-xl p-3 text-xs space-y-1">
          <p className="font-bold text-amber-300">{existingTicket.title}</p>
          <p className="text-slate-400 text-[11px]">{existingTicket.addressText}</p>
          <p className="text-[10px] text-slate-400 pt-1">
            Status: <span className="font-bold text-white">{existingTicket.status}</span> • Logged: {new Date(existingTicket.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={onForceNew}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
          >
            File New Ticket
          </button>
          <button
            type="button"
            onClick={onSupport}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition-all"
          >
            👍 Support Issue
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Citizen Component ─────────────────────────────────────────────────────

function CitizenContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("submit");
  const [allTickets, setAllTickets] = useState<GrievanceTicket[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentCode, setDepartmentCode] = useState<MunicipalDeptCode>("roads_potholes");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [location, setLocation] = useState("Patia KIIT Road, Ward 15, Bhubaneswar");
  const [landmark, setLandmark] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Ward detection
  const [detectedWard, setDetectedWard] = useState<string>("BMC Ward 15 (Patia / KIIT Area)");
  const [wardNumber, setWardNumber] = useState<number>(15);
  const [gpsLoading, setGpsLoading] = useState(false);

  // AI pre-fill
  const [aiSuggestion, setAiSuggestion] = useState<{ dept: MunicipalDeptCode; priority: PriorityLevel } | null>(null);
  const [aiDismissed, setAiDismissed] = useState(false);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Duplicate modal state
  const [duplicateCandidate, setDuplicateCandidate] = useState<GrievanceTicket | null>(null);

  const citizenId = user?.id || "cit-guest";
  const citizenName = user?.name || "Guest Citizen";
  const citizenPhone = user?.phone || "+919876543210";

  // ── Sync Store ─────────────────────────────────────────────────────────────
  const loadTickets = () => {
    seedGrievancesIfEmpty();
    setAllTickets(getGrievances());
  };

  useEffect(() => {
    loadTickets();
    const h = () => loadTickets();
    window.addEventListener(GRIEVANCE_SYNC_EVENT, h);
    return () => window.removeEventListener(GRIEVANCE_SYNC_EVENT, h);
  }, []);

  useEffect(() => {
    if (searchParams.get("ticket")) setActiveTab("tickets");
  }, [searchParams]);

  // ── AI Category Pre-Fill Heuristic ──────────────────────────────────────────
  useEffect(() => {
    if (aiDismissed) return;
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);

    aiDebounceRef.current = setTimeout(() => {
      const combined = `${title} ${description}`;
      if (combined.trim().length < 10) {
        setAiSuggestion(null);
        return;
      }

      const inferred = inferDeptAndPriority(combined);
      if (inferred && inferred.dept !== departmentCode) {
        setAiSuggestion(inferred);
      } else {
        setAiSuggestion(null);
      }
    }, 500);

    return () => { if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current); };
  }, [title, description, departmentCode, aiDismissed]);

  // ── Location & Ward Auto-Detection ─────────────────────────────────────────
  useEffect(() => {
    if (location.trim().length < 4) return;
    const wardName = detectWard({ address: location });
    if (wardName) {
      const matchNum = wardName.match(/\d+/);
      const num = matchNum ? parseInt(matchNum[0], 10) : 15;
      setDetectedWard(`${wardName} (Auto-Detected)`);
      setWardNumber(num);
    }
  }, [location]);

  const requestGpsWard = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setDetectedWard("BMC Ward 15 (Patia / KIIT Area)");
      setWardNumber(15);
      setLocation("Infocity Road, Patia, Ward 15, Bhubaneswar");
      setGpsLoading(false);
    }, 600);
  };

  // ── Form Submission Handler ────────────────────────────────────────────────
  const performSubmission = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const created = addTicket({
      citizenId,
      citizenName,
      citizenPhone,
      title: title.trim(),
      description: description.trim(),
      mediaUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      latitude: 20.3476,
      longitude: 85.8138,
      addressText: location.trim(),
      landmark: landmark.trim() || undefined,
      wardId: detectedWard.split(" ")[0] + " " + detectedWard.split(" ")[1] + " " + detectedWard.split(" ")[2],
      wardNumber,
      departmentCode,
      priority,
    });

    setSuccessTicketId(created.id);
    setSubmitting(false);

    // Reset
    setTitle(""); setDescription(""); setLandmark(""); setImageUrl("");
    setAiSuggestion(null); setAiDismissed(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const errors = validateForm(title, description, location);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    // Check duplicate candidate in same wardId & departmentCode
    const parsedWardId = detectedWard.split(" ")[0] + " " + detectedWard.split(" ")[1] + " " + detectedWard.split(" ")[2];
    const existing = allTickets.find(
      (t) =>
        t.status !== "RESOLVED" &&
        t.status !== "CLOSED" &&
        t.departmentCode === departmentCode &&
        t.wardId.toLowerCase().includes(parsedWardId.toLowerCase())
    );

    if (existing) {
      setDuplicateCandidate(existing);
      return;
    }

    performSubmission();
  };

  const handleSupportDuplicate = () => {
    if (duplicateCandidate) {
      supportExistingTicket(duplicateCandidate.id, citizenId);
      setSuccessTicketId(duplicateCandidate.id);
      setDuplicateCandidate(null);
      setActiveTab("tickets");
    }
  };

  const handleVerifyResolution = (ticketId: string, action: "confirm" | "reopen", reason?: string) => {
    verifyResolution(ticketId, action, reason);
    loadTickets();
  };

  const myTickets = allTickets.filter(
    (t) => t.citizenId === citizenId || citizenId === "cit-guest"
  );

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-900 text-slate-100">

      {/* Duplicate Interceptor Modal */}
      {duplicateCandidate && (
        <DuplicateInterceptorModal
          existingTicket={duplicateCandidate}
          onSupport={handleSupportDuplicate}
          onForceNew={() => {
            setDuplicateCandidate(null);
            performSubmission();
          }}
          onClose={() => setDuplicateCandidate(null)}
        />
      )}

      {/* Page Header */}
      <div className="px-4 py-8 sm:px-6 bg-slate-950 border-b border-slate-800">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4">
            <Link
              href={user ? "/dashboard" : "/"}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Report a Civic Issue
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Direct citizen issue filing with automated AI triage & ward routing.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              Automated BMC Ward Routing
            </span>
          </div>

          <div className="mt-6 flex gap-1 p-1 w-fit bg-slate-800 border border-slate-700 rounded-xl">
            <button
              onClick={() => setActiveTab("submit")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer",
                activeTab === "submit" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              {t.tabSubmit}
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer",
                activeTab === "tickets" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <List className="h-4 w-4" />
              {t.tabMyTickets}
              {myTickets.length > 0 && (
                <span className="ml-1 text-[10px] font-extrabold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full">
                  {myTickets.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-4">

        {/* ── SUBMIT TAB ───────────────────────────────────────────────────── */}
        {activeTab === "submit" && (
          <div className="space-y-6">

            {/* Emergency Broadcast Banner */}
            <EmergencyBroadcastBanner />

            {/* Form Card */}
            <div className="bg-slate-800 border border-slate-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">

              {successTicketId ? (
                <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/40 p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-900 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-white">Grievance Registered Successfully!</h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Ticket ID: <strong className="text-emerald-300 font-mono text-sm underline">{successTicketId}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-400 font-bold pt-1">
                      📍 Routed to {detectedWard} • {MUNICIPAL_DEPARTMENTS[departmentCode]?.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSuccessTicketId(null); setActiveTab("tickets"); }}
                    className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    View My Tickets
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 text-sm font-medium text-slate-200">
                  {/* Regional Voice Note Recorder */}
                  <AudioVoiceRecorder
                    onAutoFill={(data) => {
                      setTitle(data.title);
                      setDescription(data.description);
                      setDepartmentCode(data.departmentCode);
                      setDetectedWard(`${data.wardId} (Patia / KIIT Area)`);
                      setPriority(data.priority);
                    }}
                  />

                  {/* Citizen Banner */}
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
                    <User className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-white font-bold text-xs">Filing User: {citizenName}</p>
                      <p className="text-[10px] text-slate-400">{citizenPhone} • {citizenId}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Issue Title * (Min 8 chars)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Severe water pipe leakage near Patia Big Bazaar"
                      className={cn("w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none shadow-sm", validationErrors.title && "border-red-500 ring-1 ring-red-500")}
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); setValidationErrors((p) => ({ ...p, title: undefined })); }}
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1 font-bold">
                        <AlertCircle className="h-3.5 w-3.5" />{validationErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Detailed Description * (Min 20 chars)</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe location, severity, duration, and safety hazards…"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none shadow-sm resize-none",
                        validationErrors.description && "border-red-500 ring-1 ring-red-500"
                      )}
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); setValidationErrors((p) => ({ ...p, description: undefined })); }}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1 font-bold">
                        <AlertCircle className="h-3.5 w-3.5" />{validationErrors.description}
                      </p>
                    )}
                  </div>

                  {/* AI Suggestion Banner */}
                  {aiSuggestion && !aiDismissed && (
                    <div className="flex items-center justify-between gap-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl px-4 py-3 animate-fade-in text-emerald-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold">
                          🤖 AI Suggestion: <strong>{MUNICIPAL_DEPARTMENTS[aiSuggestion.dept]?.name}</strong> | Priority: <strong>{aiSuggestion.priority}</strong>
                        </span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setDepartmentCode(aiSuggestion.dept);
                            setPriority(aiSuggestion.priority);
                            setAiDismissed(true);
                            setAiSuggestion(null);
                          }}
                          className="text-[10px] font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                        >
                          Apply ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiDismissed(true)}
                          className="text-[10px] font-bold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Department & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Responsible Municipal Department *</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={departmentCode}
                        onChange={(e) => { setDepartmentCode(e.target.value as MunicipalDeptCode); setAiDismissed(true); }}
                      >
                        {Object.values(MUNICIPAL_DEPARTMENTS).map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.icon} {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Priority Assessment</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                        <option value="CRITICAL">Critical Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Location & Ward Pill */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Location Address *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className={cn("w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none shadow-sm pr-28", validationErrors.location && "border-red-500 ring-1 ring-red-500")}
                        value={location}
                        onChange={(e) => { setLocation(e.target.value); setValidationErrors((p) => ({ ...p, location: undefined })); }}
                      />
                      <button
                        type="button"
                        onClick={requestGpsWard}
                        disabled={gpsLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {gpsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3 text-emerald-400" />}
                        📍 GPS Ward
                      </button>
                    </div>
                    {/* Visual Pill Requirement */}
                    {detectedWard && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold mt-2">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        📍 Auto-Detected: {detectedWard}
                      </div>
                    )}
                  </div>

                  {/* Landmark & Image Upload Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Near KIIT Gate 3"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none shadow-sm"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Photo URL / Media Upload (Optional)</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="https://..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none shadow-sm pr-10"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
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

            {/* Live Officer Preview Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-3 shadow-md text-slate-200">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-400" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">
                  Live Officer Queue Preview
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                This live preview card demonstrates exactly how your report will be displayed on the Municipal Officer&apos;s operational dashboard.
              </p>

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400">TKT-2026-PREVIEW</span>
                  <span className="text-[9px] font-extrabold bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded uppercase">NEW</span>
                </div>

                <p className="font-extrabold text-white text-xs line-clamp-1">
                  {getCategoryIcon(departmentCode)} {title || "Untitled Complaint"}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{description || "Enter description to preview..."}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-emerald-400">📍 {detectedWard.split(" ")[0]} {detectedWard.split(" ")[1]} {detectedWard.split(" ")[2]}</span>
                  <span className="font-bold text-amber-400">{MUNICIPAL_DEPARTMENTS[departmentCode]?.name.split(" ")[0]}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── MY TICKETS TAB ───────────────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            {myTickets.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-800 border border-slate-700 rounded-2xl">
                <List className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold text-slate-200">{t.noData}</p>
                <button onClick={() => setActiveTab("submit")} className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold mx-auto cursor-pointer text-xs flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  <span>{t.tabSubmit}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((ticket) => (
                  <ComplaintCard
                    key={ticket.id}
                    ticket={ticket}
                    onVerifyResolution={(action, reason) => handleVerifyResolution(ticket.id, action, reason)}
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
    <Suspense fallback={<div className="p-6 text-center text-slate-400 bg-slate-900 min-h-screen">Loading portal…</div>}>
      <CitizenContent />
    </Suspense>
  );
}
