"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ExternalLink, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { interpolate, shortId } from "@/lib/utils";
import type { GrievanceCreateResponse } from "@/lib/api";
import type { DedupCandidate } from "@/lib/dedup";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServerModeProps {
  /** Server dedup response — renders read-only info + close. */
  response: GrievanceCreateResponse;
  clientDuplicate?: never;
  onClose: () => void;
  onConfirmMerge?: never;
  onForceNew?: never;
}

interface ClientModeProps {
  /** Client pre-submit dedup candidate — renders two explicit choices. */
  clientDuplicate: DedupCandidate;
  response?: never;
  onClose: () => void;
  /** "Yes, same issue — add my vote" */
  onConfirmMerge: () => void;
  /** "No, this is a different issue — submit separately" */
  onForceNew: () => void;
}

type DuplicateAlertModalProps = ServerModeProps | ClientModeProps;

// ── Component ─────────────────────────────────────────────────────────────────

export default function DuplicateAlertModal(props: DuplicateAlertModalProps) {
  const { t } = useI18n();
  const isOpen = !!(props.response ?? props.clientDuplicate);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [props.onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm"
            onClick={props.onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dup-modal-title"
          >
            <div className="w-full max-w-md rounded-sm bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-paper-dark p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-amber-civic/15">
                    <Users className="h-5 w-5 text-amber-civic" />
                  </div>
                  <h2
                    id="dup-modal-title"
                    className="font-slab text-lg font-semibold text-ink leading-tight"
                  >
                    {props.clientDuplicate
                      ? "Similar Issue Found Nearby"
                      : t.duplicateTitle}
                  </h2>
                </div>
                <button
                  onClick={props.onClose}
                  className="shrink-0 rounded p-1 text-ink/40 hover:text-ink transition-colors"
                  aria-label={t.close}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ── SERVER MODE body ──────────────────────────────────────── */}
              {props.response && (
                <>
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-ink/80 leading-relaxed">
                      {interpolate(t.duplicateBody, { count: props.response.upvote_count })}
                    </p>

                    {/* Ticket info box */}
                    <div className="rounded-sm bg-paper p-3 border border-paper-dark space-y-1">
                      <p className="text-xs text-ink/50 uppercase tracking-wider font-medium">
                        Your ticket reference
                      </p>
                      <p className="font-mono text-sm text-ink font-semibold">
                        #{shortId(props.response.id)}
                      </p>
                      <p className="text-xs text-ink/60">
                        Category:{" "}
                        <span className="font-medium">{props.response.category}</span>
                        {" · "}Priority:{" "}
                        <span className="font-medium">{props.response.priority_score}/5</span>
                      </p>
                    </div>

                    {/* Community strength bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-ink/50">
                        <span>Community reports</span>
                        <span className="font-semibold text-amber-dark">
                          {props.response.upvote_count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-paper-dark overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-civic transition-all"
                          style={{ width: `${Math.min(100, props.response.upvote_count * 12)}%` }}
                        />
                      </div>
                      <p className="text-xs text-ink/40">
                        More reports increase priority for faster resolution.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-paper-dark p-4">
                    {props.response.parent_grievance_id && (
                      <Link
                        href={`/citizen?ticket=${props.response.parent_grievance_id}`}
                        onClick={props.onClose}
                        className="btn-secondary flex-1 justify-center text-center"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t.duplicateViewTicket}
                      </Link>
                    )}
                    <button onClick={props.onClose} className="btn-primary flex-1 justify-center">
                      {t.duplicateClose}
                    </button>
                  </div>
                </>
              )}

              {/* ── CLIENT PRE-SUBMIT MODE body ───────────────────────────── */}
              {props.clientDuplicate && (
                <>
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-ink/80 leading-relaxed">
                      We found a similar complaint you submitted recently in the same area.
                      Is this the same problem, or a different one?
                    </p>

                    {/* Matched ticket summary */}
                    <div className="rounded-sm bg-amber-50 border border-amber-200 p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                          Existing report
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {props.clientDuplicate.title || props.clientDuplicate.description.slice(0, 60)}
                      </p>
                      <p className="text-xs text-slate-600">
                        Category: <span className="font-medium">{props.clientDuplicate.category}</span>
                        {props.clientDuplicate.address && (
                          <> · {props.clientDuplicate.address}</>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status: <span className="font-medium">{props.clientDuplicate.status}</span>
                        {" · "}
                        <span className="text-amber-700 font-semibold">
                          {props.clientDuplicate.upvote_count} report{props.clientDuplicate.upvote_count !== 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Choosing <strong>"Same issue"</strong> adds your voice to the existing
                      report, increasing its priority. Choosing <strong>"Different issue"</strong>{" "}
                      creates a new report — your judgment about your specific location and
                      circumstances is respected.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 border-t border-paper-dark p-4">
                    {/* "Different issue" — always on left, de-emphasised */}
                    <button
                      onClick={() => { props.onForceNew?.(); }}
                      className="btn-secondary flex-1 justify-center text-sm"
                    >
                      <X className="h-4 w-4" />
                      Different issue — submit separately
                    </button>

                    {/* "Same issue" — primary action */}
                    <button
                      onClick={() => { props.onConfirmMerge?.(); }}
                      className="btn-primary flex-1 justify-center text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Same issue — add my vote
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
