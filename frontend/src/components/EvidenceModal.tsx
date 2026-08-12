"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, CheckCircle2, AlertCircle, ImageOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { resolveGrievance } from "@/lib/api";
import { formatDate, shortId } from "@/lib/utils";
import type { GrievancePublic } from "@/lib/api";

interface EvidenceModalProps {
  grievance: GrievancePublic | null;
  onClose: () => void;
  /** Called with the updated grievance on successful resolution. */
  onResolved: (updated: GrievancePublic) => void;
}

export default function EvidenceModal({ grievance, onClose, onResolved }: EvidenceModalProps) {
  const { t } = useI18n();
  const [comments, setComments] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Reset state when modal opens with a different grievance
  useEffect(() => {
    setComments("");
    setProofFile(null);
    setProofPreview(null);
    setError(null);
    setSubmitting(false);
  }, [grievance?.id]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  async function handleApprove() {
    if (!grievance) return;
    if (!comments.trim()) {
      setError("Resolution notes are required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("comments", comments);
    if (proofFile) fd.append("proof_image", proofFile);

    try {
      const updated = await resolveGrievance(grievance.id, fd);
      onResolved(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resolution failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!grievance) return null;

  const isAlreadyResolved = grievance.status === "RESOLVED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-sm bg-white shadow-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-dark p-5">
          <div>
            <h2 className="font-slab text-lg font-semibold text-ink">{t.evidenceTitle}</h2>
            <p className="text-xs text-ink/50 mt-0.5">
              #{shortId(grievance.id)} · {grievance.category} · {formatDate(grievance.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-ink/40 hover:text-ink" aria-label={t.close}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Photo comparison */}
        <div className="grid grid-cols-2 gap-4 p-5 border-b border-paper-dark">
          {/* Original */}
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">
              {t.evidenceOriginal}
            </p>
            {grievance.image_url ? (
              <img
                src={`${API_BASE}${grievance.image_url}`}
                alt="Original complaint photo"
                className="w-full h-40 object-cover rounded-sm border border-paper-dark"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 rounded-sm border border-dashed border-paper-dark bg-paper text-ink/30">
                <ImageOff className="h-8 w-8 mb-1" />
                <p className="text-xs">{t.evidenceNoOriginal}</p>
              </div>
            )}
          </div>

          {/* Proof upload / preview */}
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">
              {t.evidenceProof}
            </p>
            {proofPreview ? (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Resolution proof"
                  className="w-full h-40 object-cover rounded-sm border border-paper-dark"
                />
                <button
                  onClick={() => { setProofFile(null); setProofPreview(null); }}
                  className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-0.5 shadow text-ink/60 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAlreadyResolved}
                className="flex flex-col items-center justify-center w-full h-40 rounded-sm border border-dashed border-civic/40 bg-civic/5 hover:bg-civic/10 transition-colors text-civic disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="h-7 w-7 mb-1" />
                <p className="text-xs font-medium">Upload proof photo</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Complaint description snippet */}
        <div className="px-5 py-3 border-b border-paper-dark bg-paper">
          <p className="text-xs text-ink/50 font-medium uppercase tracking-wider mb-1">Complaint</p>
          <p className="text-sm text-ink/80 leading-relaxed line-clamp-2">{grievance.description}</p>
        </div>

        {/* Resolution form */}
        {!isAlreadyResolved ? (
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink/60 uppercase tracking-wider mb-1">
                {t.evidenceComments} <span className="text-red-500">*</span>
              </label>
              <textarea
                className="civic-textarea"
                rows={3}
                placeholder={t.evidenceCommentsPlaceholder}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              onClick={handleApprove}
              disabled={submitting || !comments.trim()}
              className="btn-primary w-full justify-center"
            >
              {submitting ? (
                <span>Resolving…</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t.evidenceApprove}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 text-resolved font-medium">
              <CheckCircle2 className="h-5 w-5" />
              <span>This ticket has already been resolved.</span>
            </div>
            {grievance.evidence[0] && (
              <p className="mt-2 text-sm text-ink/70">{grievance.evidence[0].comments}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
