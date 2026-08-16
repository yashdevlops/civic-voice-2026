"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

/* ─── Navigation items ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { name: "Home",         href: "#home"        , sectionId: "home"         },
  { name: "About",        href: "#about"        , sectionId: "about"        },
  { name: "How It Works", href: "#how-it-works" , sectionId: "how-it-works" },
  { name: "Features",     href: "#features"     , sectionId: "features"     },
  { name: "Impact",       href: "#impact"       , sectionId: "impact"       },
  { name: "Contact",      href: "#contact"      , sectionId: "contact"      },
];

const NAV_HEIGHT = 64; // px — matches the h-16 nav bar
const SECTION_BUFFER = 40; // px — how far past a section boundary before switching

/* ─── Scroll-position-based section spy ─────────────────────────────────── */
/**
 * Returns the name of the currently "active" nav section based on real
 * document scroll position vs. each section's offsetTop.
 *
 * Why NOT IntersectionObserver:
 *   The hero uses `position: sticky` with a 300 vh outer wrapper.
 *   IO's intersection-ratio math breaks against that pattern — the inner
 *   sticky viewport stays visually on-screen for the entire 300 vh scroll
 *   distance but the outer element's bounds are what IO measures against,
 *   causing early/stuck "not intersecting" readings.
 *
 * This approach just reads real scrollY vs. real section offsetTop values —
 * symmetric, direction-agnostic, and completely unaffected by sticky layouts.
 */
function useScrollSpy(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0] ?? "");
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const getSections = () =>
      sectionIds
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return { id, top: el.offsetTop, height: el.offsetHeight };
        })
        .filter(Boolean) as { id: string; top: number; height: number }[];

    let sections: { id: string; top: number; height: number }[] = [];

    const measure = () => {
      sections = getSections();
    };

    const compute = () => {
      const scrollY = window.scrollY + NAV_HEIGHT + SECTION_BUFFER;
      // Find the last section whose top is <= our current scroll position
      let found = sections[0]?.id ?? sectionIds[0];
      for (const s of sections) {
        if (scrollY >= s.top) {
          found = s.id;
        }
      }
      setActive(found);
    };

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        compute();
        rafId.current = null;
      });
    };

    const onResize = () => {
      measure();
      compute();
    };

    measure();
    compute();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [sectionIds]);

  return active;
}

/* ─── GlassNav ───────────────────────────────────────────────────────────── */
export default function GlassNav() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Section IDs for the spy hook — memoised so the array ref is stable
  const sectionIds = NAV_LINKS.map((l) => l.sectionId);
  const activeSectionId = useScrollSpy(sectionIds);

  /* ── Scroll detection (background blur) ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mobile menu on Escape ────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,11,20,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(52,211,153,0.10)" : "none",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Logo size="md" variant="white" />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => {
                const isActive = activeSectionId === link.sectionId;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="relative px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors duration-150"
                    style={{ color: isActive ? "#34d399" : "#94a3b8" }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#e2e8f0";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                    }}
                  >
                    {link.name}
                    {isActive && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                        style={{ background: "#34d399" }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Section 3 — Sign In only (Get Started removed) */}
            <div className="hidden md:flex items-center">
              <Link
                href="/login"
                id="nav-sign-in"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 0 20px rgba(16,185,129,0.28)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 32px rgba(16,185,129,0.50)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 20px rgba(16,185,129,0.28)";
                }}
              >
                Sign In
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "#94a3b8" }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="md:hidden border-t"
            style={{
              background: "rgba(5,11,20,0.95)",
              borderColor: "rgba(52,211,153,0.10)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    color: activeSectionId === link.sectionId ? "#34d399" : "#94a3b8",
                    background: activeSectionId === link.sectionId ? "rgba(52,211,153,0.08)" : "transparent",
                  }}
                >
                  {link.name}
                </a>
              ))}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
