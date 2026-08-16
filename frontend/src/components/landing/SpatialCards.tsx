"use client";

import React, { useRef, useCallback } from "react";
import { Globe, TrendingUp, MessageSquare, Wrench } from "lucide-react";

/* ─── TiltCard ────────────────────────────────────────────────────────────── */
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Max rotation in degrees. Default 10. */
  maxDeg?: number;
  /** Perspective distance in px. Default 800. */
  perspective?: number;
}

export function TiltCard({
  children,
  className = "",
  style = {},
  maxDeg = 10,
  perspective = 800,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number | null>(null);

  /* Target / current values kept in refs — no re-renders during animation */
  const state = useRef({ rx: 0, ry: 0, trx: 0, try_: 0, gx: 50, gy: 50 });

  const animate = useCallback(() => {
    const s = state.current;
    const LERP = 0.10;
    s.rx += (s.trx - s.rx) * LERP;
    s.ry += (s.try_ - s.ry) * LERP;

    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) translateZ(0)`;
    }
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${s.gx}% ${s.gy}%, rgba(52,211,153,0.18) 0%, transparent 60%)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [perspective]);

  const onEnter = useCallback(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const onLeave = useCallback(() => {
    state.current.trx = 0;
    state.current.try_ = 0;
    // Let the lerp animate back to 0 for ~0.4s then stop
    setTimeout(() => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
      }
    }, 400);
  }, [perspective]);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;   // [0,1]
      const ny = (e.clientY - rect.top)  / rect.height;  // [0,1]

      state.current.try_ = (nx - 0.5) * maxDeg * 2;
      state.current.trx  = -(ny - 0.5) * maxDeg * 2;

      // Glow follow (snap, not lerped)
      state.current.gx = nx * 100;
      state.current.gy = ny * 100;
    },
    [maxDeg]
  );

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{ willChange: "transform", ...style }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
    >
      {/* Pointer-follow glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-none"
        style={{ borderRadius: "inherit" }}
      />
      {children}
    </div>
  );
}

/* ─── Workflow steps ─────────────────────────────────────────────────────── */
const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Report Issues Easily",
    desc: "Record a voice memo, type a short message, or capture a photo. Our AI identifies category, priority, and location auto-detects coordinates.",
    accent: "#10b981",
  },
  {
    step: "02",
    title: "Smart Aggregation",
    desc: "ChromaDB maps duplicates within a 100m radius, adding your support to existing tickets to prevent duplicate spam and show community weight.",
    accent: "#6366f1",
  },
  {
    step: "03",
    title: "Track & Resolve",
    desc: "Follow the active resolution timeline. Review real photos uploaded by city officers proving that the work has been completed.",
    accent: "#f59e0b",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative"
      style={{ background: "#0a1420" }}
    >
      {/* Top fade from light */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(180deg, #f8fafc 0%, transparent 100%)" }}
      />
      {/* Bottom fade to light */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(0deg, #f8fafc 0%, transparent 100%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <span
            className="text-xs font-extrabold uppercase tracking-widest"
            style={{ color: "#34d399" }}
          >
            Workflow Overview
          </span>
          <h2
            className="text-3xl sm:text-4xl font-extrabold font-display"
            style={{ color: "#f1f5f9" }}
          >
            Three Simple Steps to Make a Difference
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORKFLOW_STEPS.map((item) => (
            <TiltCard
              key={item.step}
              maxDeg={8}
              className="rounded-2xl p-6 space-y-4 text-left"
              style={{
                background: "rgba(15,23,42,0.70)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
              }}
            >
              <span
                className="text-4xl font-extrabold font-display block"
                style={{ color: item.accent, opacity: 0.25 }}
              >
                {item.step}
              </span>
              <div
                className="h-px w-10"
                style={{ background: item.accent, opacity: 0.6 }}
              />
              <h3
                className="text-base font-bold"
                style={{ color: "#f1f5f9" }}
              >
                {item.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {item.desc}
              </p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature cards ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "Speech-to-Text Triage",
    desc: "Whisper integration processes voice complaints in regional languages and summarises details instantly.",
    icon: Globe,
    color: "#10b981",
  },
  {
    title: "Participatory Budgeting",
    desc: "Vote on local project proposals directly to impact the allocation of municipal resources.",
    icon: TrendingUp,
    color: "#6366f1",
  },
  {
    title: "Direct Messages",
    desc: "Communicate with specific departments like Roads, Waste Management, or BWSSB directly in-app.",
    icon: MessageSquare,
    color: "#f59e0b",
  },
  {
    title: "Evidence Validation",
    desc: "Resolution requires photographic upload evidence, ensuring true execution before tickets close.",
    icon: Wrench,
    color: "#ec4899",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
            System Capability
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-display">
            Advanced Tools for Modern Municipalities
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-500 leading-relaxed">
            Purpose-built features that close the loop between residents and municipal officers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <TiltCard
                key={f.title}
                maxDeg={7}
                className="p-5 rounded-2xl space-y-3 group transition-all duration-200"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: f.color }} />
                </span>
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Impact section ─────────────────────────────────────────────────────── */
const IMPACT_ITEMS = [
  {
    stat: "250K+",
    title: "Issues Tackled",
    desc: "Thousands of potholes filled, garbage dumps cleared, and streetlights repaired across urban neighbourhoods.",
    color: "#10b981",
  },
  {
    stat: "4.2 Days",
    title: "Avg. SLA Response",
    desc: "Average response time dropped significantly since the introduction of auto-routing categorisation AI.",
    color: "#6366f1",
  },
  {
    stat: "92%",
    title: "Resolution Compliance",
    desc: "Transparency controls ensure that nearly all submitted issues are verified and completed.",
    color: "#f59e0b",
  },
];

export function ImpactSection() {
  return (
    <section id="impact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
            Measurable Success
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-display">
            Transforming Cities, One Block at a Time
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {IMPACT_ITEMS.map((item) => (
            <TiltCard
              key={item.title}
              maxDeg={6}
              className="bg-white rounded-2xl p-7 space-y-3 shadow-sm"
              style={{ border: `1px solid ${item.color}20` }}
            >
              <div
                className="text-3xl font-extrabold font-display"
                style={{ color: item.color }}
              >
                {item.stat}
              </div>
              <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              {/* Bottom accent bar */}
              <div
                className="h-0.5 w-12 rounded-full"
                style={{ background: item.color, opacity: 0.5 }}
              />
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
