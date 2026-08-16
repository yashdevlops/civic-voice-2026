"use client";

import React, { useState } from "react";
import GlassNav from "@/components/landing/GlassNav";
import ScrollZoomHero from "@/components/landing/ScrollZoomHero";
import AboutSection from "@/components/landing/AboutSection";
import { WorkflowSection, FeaturesSection, ImpactSection } from "@/components/landing/SpatialCards";
import HotlineModal from "@/components/landing/HotlineModal";
import SiteFooter from "@/components/SiteFooter";
import { Mail, Phone } from "lucide-react";

export default function LandingPage() {
  const [hotlineOpen, setHotlineOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "#f8fafc" }}>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <GlassNav />

      {/* ── Hero: pinned scroll-scrubbed video city-dive ────────────────── */}
      <ScrollZoomHero />

      {/* ── About ──────────────────────────────────────────────────────── */}
      <AboutSection />

      {/* ── How It Works (dark spatial section) ───────────────────────── */}
      <WorkflowSection />

      {/* ── Features ───────────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── Impact ─────────────────────────────────────────────────────── */}
      <ImpactSection />

      {/* ── Contact ────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Eyebrow */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-display">
              Ready to Empower Your Municipality?
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
              Contact our product team to schedule a demo deployment for your
              ward, municipality, or town assembly.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:yashdeo01@gmail.com"
              id="contact-email-btn"
              className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
            >
              <Mail className="h-3.5 w-3.5" />
              Email Support
            </a>

            {/* Hotline button — opens modal instead of bare tel: link */}
            <button
              type="button"
              id="contact-hotline-btn"
              onClick={() => setHotlineOpen(true)}
              className="btn-outline px-6 py-2.5 text-xs flex items-center gap-2"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Hotline
            </button>
          </div>

          {/* Social proof row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              { label: "250K+ Issues Resolved",     color: "#10b981" },
              { label: "850+ Active Communities",   color: "#6366f1" },
              { label: "Avg. 4.2 Day Response SLA", color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-xs font-semibold text-slate-600">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <SiteFooter />

      {/* ── Hotline modal (keyboard-dismissible) ───────────────────────── */}
      <HotlineModal open={hotlineOpen} onClose={() => setHotlineOpen(false)} />
    </div>
  );
}
