'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { MapPin, CheckCircle2, Users, ShieldCheck } from 'lucide-react';
import { useScrollZoomProgress } from '@/hooks/useScrollZoomProgress';
import { useCountUp } from '@/hooks/useCountUp';

/* ─── Constants ───────────────────────────────────────────────────────────── */
const MIN_SCALE = 1.0;
const MAX_SCALE = 1.9;
const VIDEO_SCRUB_END = 0.7;   // first 70% of pin scroll → video scrub

/* ─── Easing ─────────────────────────────────────────────────────────────── */
function easeInCubic(t: number): number {
  return t * t * t;
}

/* ─── Stat data ──────────────────────────────────────────────────────────── */
interface StatItem {
  rawValue: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const STATS: StatItem[] = [
  { rawValue: 250, suffix: 'K+', label: 'Issues Reported',  icon: MapPin       },
  { rawValue: 120, suffix: 'K+', label: 'Resolved',          icon: CheckCircle2 },
  { rawValue: 850, suffix: '+',  label: 'Communities',        icon: Users        },
  { rawValue: 95,  suffix: '%',  label: 'Transparency',       icon: ShieldCheck  },
];

/* ─── StatCell ───────────────────────────────────────────────────────────── */
function StatCell({ stat, visible }: { stat: StatItem; visible: boolean }) {
  const count = useCountUp({ target: stat.rawValue, duration: 2200, enabled: visible });
  const Icon = stat.icon;
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <span
        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
      >
        <Icon className="h-4 w-4" style={{ color: '#34d399' }} />
      </span>
      <span className="text-xl md:text-2xl font-extrabold text-white font-display tracking-tight">
        {count}{stat.suffix}
      </span>
      <span
        className="text-[10px] md:text-xs font-bold uppercase tracking-widest"
        style={{ color: '#94a3b8' }}
      >
        {stat.label}
      </span>
    </div>
  );
}

/* ─── Two-phase scale curve ──────────────────────────────────────────────── */
function computeScale(progress: number): number {
  if (progress <= VIDEO_SCRUB_END) {
    const localT = progress / VIDEO_SCRUB_END;
    return MIN_SCALE + 0.15 * easeInCubic(localT);
  }
  const localT = (progress - VIDEO_SCRUB_END) / (1 - VIDEO_SCRUB_END);
  return 1.15 + (MAX_SCALE - 1.15) * easeInCubic(localT);
}

/* ─── ScrollZoomHero ─────────────────────────────────────────────────────── */
export default function ScrollZoomHero() {
  const outerRef  = useRef<HTMLElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady]         = useState(false);
  const [videoError, setVideoError]         = useState(false);
  const [statsVisible, setStatsVisible]     = useState(true); // Default true for immediate mount display
  const [isMounted, setIsMounted]           = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Detect hydration + reduced motion (client-only)
  useEffect(() => {
    setIsMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const progress = useScrollZoomProgress(outerRef as React.RefObject<HTMLElement>);

  /* ── Video: pause immediately on load, never allow autoplay ─────────────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || prefersReduced) return;

    const onLoaded = () => {
      v.pause();
      v.muted = true;
      setVideoReady(true);
    };
    const onError = () => setVideoError(true);

    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('error', onError);
    if (v.readyState >= 1) onLoaded();

    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('error', onError);
    };
  }, [prefersReduced]);

  /* ── Video scrub: drive currentTime from scroll progress ─────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoReady || prefersReduced || videoError) return;
    if (!v.duration || Number.isNaN(v.duration)) return;

    const videoProgress = Math.min(1, progress / VIDEO_SCRUB_END);
    const targetTime = videoProgress * v.duration;

    if (Math.abs(v.currentTime - targetTime) > 0.02) {
      v.currentTime = targetTime;
    }
  }, [progress, videoReady, prefersReduced, videoError]);

  /* ── Derived display values ──────────────────────────────────────────────── */
  const currentScale = isMounted && !prefersReduced ? computeScale(progress) : 1.0;

  // Headline / Sub-copy: 1.0 immediately on mount (progress=0) through 0.25, then fades out 0.25 → 0.40
  const contentOpacity = !isMounted
    ? 1
    : progress <= 0.25
      ? 1
      : Math.max(0, 1 - (progress - 0.25) / 0.15);

  const contentShiftY = isMounted && progress > 0.05
    ? -Math.min(progress, 0.4) * 120
    : 0;

  // HUD Stat bar: 1.0 immediately on mount (progress=0) through 0.40, then fades out 0.40 → 0.55
  const hudOpacity = !isMounted
    ? 1
    : progress <= 0.40
      ? 1
      : Math.max(0, 1 - (progress - 0.4) / 0.15);

  // Atmosphere layer opacities
  const hazeOpacity = !isMounted
    ? 0
    : progress < 0.35
      ? (progress / 0.35) * 0.3
      : progress < 0.5
        ? 0.3
        : Math.max(0, 0.3 - ((progress - 0.5) / 0.2) * 0.3);

  const vignetteOpacity = !isMounted
    ? 0.25
    : 0.25 + Math.min(progress, 1) * 0.3;

  const bloomOpacity = !isMounted
    ? 0
    : progress > VIDEO_SCRUB_END
      ? Math.min(0.18, ((progress - VIDEO_SCRUB_END) / 0.3) * 0.18)
      : 0;

  /* ─── REDUCED MOTION: static poster fallback ─────────────────────────────── */
  if (isMounted && prefersReduced) {
    return (
      <section
        id="home"
        className="relative flex flex-col justify-center overflow-hidden"
        style={{
          minHeight: '100svh',
          background: '#050b14',
        }}
      >
        {/* Static poster background */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/hero/city-flythrough-poster.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 62%',
          }}
        />
        {/* Atmospheric scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,11,20,0.35) 0%, rgba(5,11,20,0.25) 40%, rgba(5,11,20,0.65) 75%, rgba(5,11,20,0.95) 100%)',
          }}
        />
        <HeroContentAndHUD
          contentOpacity={1}
          contentShiftY={0}
          hudOpacity={1}
          statsVisible={statsVisible}
        />
      </section>
    );
  }

  return (
    /* ── Outer: tall scroll-distance driver ─────────────────────────────────── */
    <section
      ref={outerRef as React.RefObject<HTMLElement>}
      id="home"
      className="zoom-hero-outer"
    >
      {/* ── Inner sticky viewport ─────────────────────────────────────────── */}
      <div
        className="zoom-hero-sticky"
        style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}
      >
        {/* ── Poster background: visible while video loads / on error ────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/hero/city-flythrough-poster.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 62%',
            transform: `scale(${currentScale})`,
            transformOrigin: '50% 62%',
            willChange: 'transform',
          }}
        />

        {/* ── Video layer ─────────────────────────────────────────────────── */}
        {!prefersReduced && !videoError && (
          <video
            ref={videoRef}
            aria-hidden="true"
            className="zoom-hero-video"
            src="/hero/city-flythrough.mp4"
            poster="/hero/city-flythrough-poster.jpg"
            muted
            playsInline
            preload="auto"
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: '50% 62%',
              willChange: 'transform',
            }}
          />
        )}

        {/* ── Vignette: dark radial corners ────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="zoom-hero-vignette"
          style={{ opacity: vignetteOpacity }}
        />

        {/* ── Warm haze ───────────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="zoom-hero-haze"
          style={{ opacity: hazeOpacity }}
        />

        {/* ── Emerald bloom ───────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="zoom-hero-bloom"
          style={{ opacity: bloomOpacity }}
        />

        {/* ── Film grain ──────────────────────────────────────────────────── */}
        <div aria-hidden="true" className="zoom-hero-grain" />

        {/* ── Atmospheric scrim overlay ────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,11,20,0.32) 0%, rgba(5,11,20,0.18) 40%, rgba(5,11,20,0.58) 75%, rgba(5,11,20,0.94) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Unified Hero Content & HUD Flex Container (No Overlap) ────────── */}
        <HeroContentAndHUD
          contentOpacity={contentOpacity}
          contentShiftY={contentShiftY}
          hudOpacity={hudOpacity}
          statsVisible={statsVisible}
        />

        {/* ── Scroll indicator ─────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-30"
          style={{ opacity: progress < 0.04 ? 1 : Math.max(0, 1 - progress / 0.04) }}
        >
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Scroll
          </span>
          <div
            className="w-px h-6"
            style={{
              background: 'linear-gradient(180deg, rgba(255,220,150,0.6) 0%, transparent 100%)',
              animation: 'scrollPulse 1.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Exit gradient: smooth handoff into About section ─────────────── */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
          style={{
            height: '14vh',
            background: 'linear-gradient(to bottom, transparent 0%, #050b14 55%, #ffffff 100%)',
          }}
        />
      </div>
    </section>
  );
}

/* ─── Sub-component: Unified Content + HUD Container ─────────────────────── */

interface HeroContentAndHUDProps {
  contentOpacity: number;
  contentShiftY: number;
  hudOpacity: number;
  statsVisible: boolean;
}

function HeroContentAndHUD({
  contentOpacity,
  contentShiftY,
  hudOpacity,
  statsVisible,
}: HeroContentAndHUDProps) {
  return (
    <div className="relative z-10 mx-auto max-w-5xl w-full h-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center pointer-events-none">
      
      {/* Top / Center Section: Eyebrow + Headline + Sub-copy */}
      <div
        className="my-auto space-y-4 max-w-4xl pointer-events-auto"
        style={{
          opacity: contentOpacity,
          transform: `translateY(${contentShiftY}px)`,
          willChange: 'opacity, transform',
        }}
      >
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.22)',
            color: '#34d399',
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Civic Platform — India 2026
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none font-display"
          style={{ color: '#f8fafc', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          <span className="block">Your Voice.</span>
          <span className="block mt-1 sm:mt-2">Stronger Cities.</span>
          <span
            className="block mt-1 sm:mt-2"
            style={{
              background: 'linear-gradient(135deg, #34d399 0%, #6ee7b7 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Better Tomorrow.
          </span>
        </h1>

        {/* Sub-copy */}
        <p
          className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed font-medium"
          style={{ color: 'rgba(255,255,255,0.72)', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          CivicVoice is an AI-powered platform that helps citizens report issues,
          track real-time progress, and participate in shaping better communities —
          one verified resolution at a time.
        </p>
      </div>

      {/* Bottom Section: HUD stat bar (in normal flex flow below text) */}
      <div
        className="w-full max-w-3xl pointer-events-auto shrink-0 mb-4"
        style={{
          opacity: hudOpacity,
          willChange: 'opacity',
        }}
      >
        <div
          className="rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0"
          style={{
            background: 'rgba(10,20,32,0.72)',
            border: '1px solid rgba(52,211,153,0.14)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
            borderTopColor: 'rgba(255,180,80,0.15)',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-4 sm:px-6 sm:py-5">
              <StatCell stat={stat} visible={statsVisible} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
