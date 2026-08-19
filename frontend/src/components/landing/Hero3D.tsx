"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, LayoutGrid, MapPin, CheckCircle2, Users, ShieldCheck } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface StatItem {
  rawValue: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const STATS: StatItem[] = [
  { rawValue: 250, suffix: "K+", label: "Issues Reported", icon: MapPin },
  { rawValue: 120, suffix: "K+", label: "Resolved", icon: CheckCircle2 },
  { rawValue: 850, suffix: "+", label: "Communities", icon: Users },
  { rawValue: 95, suffix: "%", label: "Transparency", icon: ShieldCheck },
];

/* ─── Animated stat cell ─────────────────────────────────────────────────── */
function StatCell({ stat, visible }: { stat: StatItem; visible: boolean }) {
  const count = useCountUp({ target: stat.rawValue, duration: 2200, enabled: visible });
  const Icon = stat.icon;

  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <span
        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}
      >
        <Icon className="h-4 w-4" style={{ color: "#34d399" }} />
      </span>
      <span className="text-xl md:text-2xl font-extrabold text-white font-display tracking-tight">
        {count}
        {stat.suffix}
      </span>
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
        {stat.label}
      </span>
    </div>
  );
}

/* ─── Hero3D ─────────────────────────────────────────────────────────────── */
export default function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerBgRef = useRef<HTMLDivElement>(null);
  const layerMidRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Smooth mouse/gyro state accumulated in a ref — never triggers re-renders
  const mouseRef = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const [statsVisible, setStatsVisible] = useState(false);

  /* Intersection observer — fire count-up when stat bar scrolls into view */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.35 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  /* Parallax pointer tracking */
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      mouseRef.current.tx = (e.clientX / w - 0.5) * 2; // [-1, 1]
      mouseRef.current.ty = (e.clientY / h - 0.5) * 2;
    };

    const animate = () => {
      const m = mouseRef.current;
      const LERP = 0.045; // lower = lazier follow
      m.mx += (m.tx - m.mx) * LERP;
      m.my += (m.ty - m.my) * LERP;

      if (layerBgRef.current) {
        layerBgRef.current.style.transform = `translate(${m.mx * -14}px, ${m.my * -10}px) scale(1.06)`;
      }
      if (layerMidRef.current) {
        layerMidRef.current.style.transform = `translate(${m.mx * 8}px, ${m.my * 5}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex flex-col justify-center overflow-hidden"
      style={{
        minHeight: "100svh",
        background: "#050b14",
      }}
    >
      {/* ── Layer 1: City photograph (parallax BG) ────────────────────── */}
      <div
        ref={layerBgRef}
        aria-hidden="true"
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: "url('https://i.pinimg.com/1200x/e1/1d/43/e11d43ddba9f60b850cb3d86de575e59.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          transformOrigin: "center center",
          transition: "transform 0.1s linear",
        }}
      />

      {/* ── Layer 2: Multi-stop atmospheric scrim ───────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,11,20,0.45) 0%, rgba(5,11,20,0.30) 40%, rgba(5,11,20,0.70) 75%, rgba(5,11,20,0.96) 100%)",
        }}
      />

      {/* ── Layer 3: Emerald ambient light leak (top-left) ─────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-[55vw] h-[55vw] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 15% 20%, rgba(16,185,129,0.13) 0%, transparent 65%)",
        }}
      />

      {/* ── Layer 4: Subtle grid overlay ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
        }}
      />

      {/* ── Layer 5: Floating mid-layer particles (parallax counter-move) ─ */}
      <div
        ref={layerMidRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ transition: "transform 0.1s linear" }}
      >
        {/* Orb 1 */}
        <div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            top: "12%",
            right: "8%",
            background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Orb 2 */}
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            bottom: "20%",
            left: "5%",
            background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 text-center pt-32 pb-12 md:pt-40 md:pb-16 space-y-8">

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.22)",
            color: "#34d399",
          }}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Civic Platform — India 2026
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none font-display"
          style={{ color: "#f8fafc" }}
        >
          <span className="block">Your Voice.</span>
          <span className="block mt-1 sm:mt-2">Stronger Cities.</span>
          <span
            className="block mt-1 sm:mt-2"
            style={{
              background: "linear-gradient(135deg, #34d399 0%, #6ee7b7 50%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Better Tomorrow.
          </span>
        </h1>

        {/* Sub-copy */}
        <p
          className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed font-medium"
          style={{ color: "#94a3b8" }}
        >
          CivicVoice is an AI-powered platform that helps citizens report issues,
          track real-time progress, and participate in shaping better communities —
          one verified resolution at a time.
        </p>

        {/* CTA row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/citizen"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 0 32px rgba(16,185,129,0.35)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 48px rgba(16,185,129,0.55)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 32px rgba(16,185,129,0.35)"; }}
          >
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Report an Issue
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#e2e8f0",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(255,255,255,0.10)";
              el.style.borderColor = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(255,255,255,0.06)";
              el.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >
            <LayoutGrid className="h-4 w-4" />
            Explore Dashboard
          </Link>
        </div>

        {/* ── Glass HUD stat bar ─────────────────────────────────────────── */}
        <div
          className="mt-10 md:mt-14 mx-auto max-w-3xl rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0"
          style={{
            background: "rgba(10,20,32,0.72)",
            border: "1px solid rgba(52,211,153,0.14)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 0 60px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="px-6 py-5">
              <StatCell stat={stat} visible={statsVisible} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{
            background: "linear-gradient(180deg, rgba(52,211,153,0.5) 0%, transparent 100%)",
            animation: "scrollPulse 1.8s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
