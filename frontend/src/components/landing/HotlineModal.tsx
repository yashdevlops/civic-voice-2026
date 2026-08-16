"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { X, Phone, Mail, Clock, MapPin } from "lucide-react";

interface HotlineModalProps {
  open: boolean;
  onClose: () => void;
}

const HOTLINE_LINES = [
  { dept: "General Helpline",        number: "+91 1800-XXX-XXXX", hours: "24 × 7",         icon: Phone },
  { dept: "Roads & Potholes",        number: "+91 80-XXXX-0001",  hours: "Mon–Sat 9–6",    icon: MapPin },
  { dept: "Water Supply (BWSSB)",    number: "+91 80-XXXX-0002",  hours: "Mon–Sat 9–6",    icon: Phone },
  { dept: "Electricity (BESCOM)",    number: "+91 80-XXXX-0003",  hours: "24 × 7",         icon: Phone },
  { dept: "Sanitation & Waste",      number: "+91 80-XXXX-0004",  hours: "Mon–Sun 7–7",    icon: Phone },
  { dept: "Email Support",           number: "yashdeo01@gmail.com", hours: "Replies in 24h", icon: Mail },
];

export default function HotlineModal({ open, onClose }: HotlineModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Keyboard: Escape dismisses, trap focus inside panel */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Tab trap
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    // Auto-focus the close button when modal opens
    setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 50);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Municipal Support Hotlines"
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(2,6,14,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={onBackdropClick}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "#0d1f2d",
          border: "1px solid rgba(52,211,153,0.15)",
          boxShadow: "0 0 80px rgba(16,185,129,0.10), 0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.22)" }}
            >
              <Phone className="h-4 w-4" style={{ color: "#34d399" }} />
            </span>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                Municipal Support Hotlines
              </h2>
              <p className="text-[10px]" style={{ color: "#64748b" }}>
                Press Esc to dismiss
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close hotline modal"
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hotline list */}
        <ul className="px-5 py-4 space-y-2.5 max-h-80 overflow-y-auto">
          {HOTLINE_LINES.map((line) => {
            const Icon = line.icon;
            const isEmail = line.number.includes("@");
            return (
              <li
                key={line.dept}
                className="flex items-center justify-between gap-4 p-3 rounded-xl transition-colors"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(16,185,129,0.08)" }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: "#34d399" }} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "#e2e8f0" }}>
                      {line.dept}
                    </p>
                    <a
                      href={isEmail ? `mailto:${line.number}` : `tel:${line.number.replace(/\s/g, "")}`}
                      className="text-[11px] font-mono transition-colors"
                      style={{ color: "#34d399" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6ee7b7"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#34d399"; }}
                    >
                      {line.number}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" style={{ color: "#475569" }} />
                  <span className="text-[10px]" style={{ color: "#475569" }}>
                    {line.hours}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div
          className="px-5 py-3 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[10px]" style={{ color: "#334155" }}>
            For life-threatening emergencies dial <strong style={{ color: "#ef4444" }}>112</strong>. These numbers are for non-urgent civic issues only.
          </p>
        </div>
      </div>
    </div>
  );
}
