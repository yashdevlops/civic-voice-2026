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

      {/* ── Quick Portal Access Section ─────────────────────────────────── */}
      <section className="py-16 bg-slate-900 border-t border-b border-slate-800 text-white font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-emerald-400 tracking-widest uppercase">
              CivicVoice Command Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Access Your Dedicated Portal
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
              Select your role to access automated ward triage, emergency broadcasting, and civic issue resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Citizen Portal Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all shadow-lg">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-700/50 flex items-center justify-center text-xl">
                  📢
                </div>
                <h3 className="text-lg font-bold text-white font-display">Citizen Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Report civic issues with GPS ward auto-detection, AI category suggestions, and real-time SLA tracking.
                </p>
              </div>
              <a
                href="/citizen"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition-all shadow-md block"
              >
                Launch Citizen Portal →
              </a>
            </div>

            {/* Municipal Officer Portal Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all shadow-lg">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-700/50 flex items-center justify-center text-xl">
                  🏢
                </div>
                <h3 className="text-lg font-bold text-white font-display">Municipal Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Department operational dashboard, field worker dispatch, BOQ material estimation, and proof verification.
                </p>
              </div>
              <a
                href="/municipal/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-all shadow-md block"
              >
                Launch Municipal Dashboard →
              </a>
            </div>

            {/* Commissioner Command Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-red-500/50 transition-all shadow-lg">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-700/50 flex items-center justify-center text-xl">
                  🚨
                </div>
                <h3 className="text-lg font-bold text-white font-display">Commissioner Command</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time emergency broadcast advisory dispatch, ward outage overrides, and contractor quality audit.
                </p>
              </div>
              <a
                href="/commissioner/broadcast"
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs text-center transition-all shadow-md block"
              >
                Launch Commissioner Command →
              </a>
            </div>
          </div>
        </div>
      </section>

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
