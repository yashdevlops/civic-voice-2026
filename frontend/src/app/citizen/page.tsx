"use client";
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin, Send, Loader2, CheckCircle2, AlertCircle,
  List, PlusCircle, Navigation
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitGrievance, getCitizenGrievances } from "@/lib/api";
import type { GrievanceCreateResponse, GrievancePublic } from "@/lib/api";
import AudioRecorder from "@/components/AudioRecorder";
import DuplicateAlertModal from "@/components/DuplicateAlertModal";
import TicketStatusTimeline from "@/components/TicketStatusTimeline";
import { cn } from "@/lib/utils";

// Demo citizen ID — in production this comes from auth.
// Using a hardcoded demo value so the seed script and UI share the same citizen.
const DEMO_CITIZEN_ID = "demo-citizen-001";

type Tab = "submit" | "tickets";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function CitizenPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("submit");

  // ── Form state ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "ok" | "denied">("idle");

  // ── Submission state ────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [duplicateResponse, setDuplicateResponse] = useState<GrievanceCreateResponse | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── My Tickets state ────────────────────────────────────────────────────
  const [myTickets, setMyTickets] = useState<GrievancePublic[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // On mount: if ?ticket= in URL, switch to tickets tab
  useEffect(() => {
    if (searchParams.get("ticket")) {
      setActiveTab("tickets");
    }
  }, [searchParams]);

  // Load my tickets when switching to the tab
  useEffect(() => {
    if (activeTab === "tickets") {
      loadMyTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadMyTickets() {
    setTicketsLoading(true);
    try {
      const data = await getCitizenGrievances(DEMO_CITIZEN_ID);
      setMyTickets(data);
    } catch {
      // Silent: show empty state
    } finally {
      setTicketsLoading(false);
    }
  }

  function showToast(type: Toast["type"], message: string) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationStatus("ok");
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 8000 }
    );
  }

  const handleAudioReady = useCallback((blob: Blob) => {
    setAudioBlob(blob);
  }, []);

  const handleAudioClear = useCallback(() => {
    setAudioBlob(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!description.trim() && !audioBlob) {
      showToast("error", "Please enter a description or record a voice complaint.");
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    if (title.trim()) fd.append("title", title.trim());
    if (description.trim()) fd.append("description", description.trim());
    if (address.trim()) fd.append("address", address.trim());
    if (category) fd.append("category", category);
    if (latitude !== null) fd.append("latitude", String(latitude));
    if (longitude !== null) fd.append("longitude", String(longitude));
    fd.append("citizen_id", DEMO_CITIZEN_ID);
    if (imageFile) fd.append("image", imageFile);
    if (audioBlob) fd.append("audio", audioBlob, "recording.webm");

    try {
      const response = await submitGrievance(fd);

      if (response.is_duplicate) {
        setDuplicateResponse(response);
      } else {
        showToast(
          "success",
          `${t.formSuccess} #${response.id.substring(0, 8).toUpperCase()}`
        );
      }

      // Reset form
      setTitle("");
      setDescription("");
      setAddress("");
      setCategory("");
      setLatitude(null);
      setLongitude(null);
      setImageFile(null);
      setAudioBlob(null);
      setLocationStatus("idle");
    } catch (err: unknown) {
      const detail =
        err instanceof Error ? err.message : t.formError;
      showToast("error", detail);
    } finally {
      setSubmitting(false);
    }
  }

  const CATEGORIES = [
    { value: "", label: t.formCategoryAuto },
    { value: "SANITATION", label: "Sanitation" },
    { value: "ROADS", label: "Roads" },
    { value: "ELECTRICITY", label: "Electricity" },
    { value: "WATER", label: "Water" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* Page header */}
      <div className="bg-civic text-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-slab text-2xl sm:text-3xl font-semibold">{t.citizenTitle}</h1>
          <p className="mt-1 text-white/70 text-sm">{t.citizenSubtitle}</p>

          {/* Tab switcher */}
          <div className="mt-5 flex gap-1 bg-white/10 rounded p-1 w-fit">
            <button
              onClick={() => setActiveTab("submit")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors",
                activeTab === "submit"
                  ? "bg-amber-civic text-ink"
                  : "text-white/70 hover:text-white"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              {t.tabSubmit}
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors",
                activeTab === "tickets"
                  ? "bg-amber-civic text-ink"
                  : "text-white/70 hover:text-white"
              )}
            >
              <List className="h-4 w-4" />
              {t.tabMyTickets}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
        {/* ── Submit Tab ──────────────────────────────────────────────────── */}
        {activeTab === "submit" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1">
                {t.formTitle}
              </label>
              <input
                type="text"
                className="civic-input"
                placeholder="e.g. Broken street light near the park"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1">
                {t.formDescription}
              </label>
              <textarea
                className="civic-textarea"
                rows={4}
                placeholder={t.formDescPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Audio recorder */}
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1">
                {t.formAudio}
              </label>
              <AudioRecorder
                onAudioReady={handleAudioReady}
                onAudioClear={handleAudioClear}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1">
                {t.formCategory}
              </label>
              <select
                className="civic-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider">
                Location
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationStatus === "detecting" || locationStatus === "ok"}
                  className={cn(
                    "flex items-center gap-1.5 text-sm px-3 py-2 rounded border transition-colors",
                    locationStatus === "ok"
                      ? "border-resolved text-resolved bg-resolved-bg"
                      : "border-civic/30 text-civic hover:bg-civic/5"
                  )}
                >
                  {locationStatus === "detecting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : locationStatus === "ok" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  {locationStatus === "detecting"
                    ? t.formDetectingLocation
                    : locationStatus === "ok"
                      ? `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`
                      : t.formDetectLocation}
                </button>
              </div>
              {locationStatus === "denied" && (
                <p className="text-xs text-amber-dark flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t.formLocationDenied}
                </p>
              )}
              <input
                type="text"
                className="civic-input"
                placeholder={t.formAddressPlaceholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1">
                {t.formImage}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="btn-ghost border border-paper-dark"
                >
                  <MapPin className="h-4 w-4" />
                  {imageFile ? imageFile.name : "Choose image…"}
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-xs text-ink/40 hover:text-ink/70"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.formSubmitting}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t.formSubmit}
                </>
              )}
            </button>
          </form>
        )}

        {/* ── My Tickets Tab ───────────────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <div>
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-16 text-ink/40">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                {t.loading}
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-16 text-ink/40">
                <List className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t.noData}</p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-4 btn-primary"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t.tabSubmit}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((g) => (
                  <TicketStatusTimeline key={g.id} grievance={g} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        response={duplicateResponse}
        onClose={() => setDuplicateResponse(null)}
      />

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "toast",
              toast.type === "error" && "bg-red-700"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
