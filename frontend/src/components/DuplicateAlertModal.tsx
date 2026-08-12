"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { interpolate, shortId } from "@/lib/utils";
import type { GrievanceCreateResponse } from "@/lib/api";

interface DuplicateAlertModalProps {
  response: GrievanceCreateResponse | null;
  onClose: () => void;
}

export default function DuplicateAlertModal({ response, onClose }: DuplicateAlertModalProps) {
  const { t } = useI18n();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {response && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal — framer motion only used here and vote progress bar per spec §7 */}
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
                    {t.duplicateTitle}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded p-1 text-ink/40 hover:text-ink transition-colors"
                  aria-label={t.close}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-ink/80 leading-relaxed">
                  {interpolate(t.duplicateBody, { count: response.upvote_count })}
                </p>

                {/* Ticket info box */}
                <div className="rounded-sm bg-paper p-3 border border-paper-dark space-y-1">
                  <p className="text-xs text-ink/50 uppercase tracking-wider font-medium">
                    Your ticket reference
                  </p>
                  <p className="font-mono text-sm text-ink font-semibold">
                    #{shortId(response.id)}
                  </p>
                  <p className="text-xs text-ink/60">
                    Category:{" "}
                    <span className="font-medium">{response.category}</span>
                    {" · "}Priority:{" "}
                    <span className="font-medium">{response.priority_score}/5</span>
                  </p>
                </div>

                {/* Community strength bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-ink/50">
                    <span>Community reports</span>
                    <span className="font-semibold text-amber-dark">{response.upvote_count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-paper-dark overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-civic transition-all"
                      style={{ width: `${Math.min(100, response.upvote_count * 12)}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink/40">
                    More reports increase priority for faster resolution.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2 border-t border-paper-dark p-4">
                {response.parent_grievance_id && (
                  <Link
                    href={`/citizen?ticket=${response.parent_grievance_id}`}
                    onClick={onClose}
                    className="btn-secondary flex-1 justify-center text-center"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t.duplicateViewTicket}
                  </Link>
                )}
                <button onClick={onClose} className="btn-primary flex-1 justify-center">
                  {t.duplicateClose}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
