"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

const PILLARS = [
  "AI-powered issue triage and auto-categorisation",
  "Real-time officer assignment and SLA tracking",
  "Photographic evidence verification before closure",
  "Participatory budgeting with democratic voting",
  "Multilingual voice-to-text complaint submission",
  "Cross-department deduplication via ChromaDB",
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <div className="space-y-6">
            <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
              About Our Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-display leading-tight">
              Connecting Citizens and{" "}
              <span className="text-primary">Local Authorities</span> Seamlessly
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              CivicVoice was founded with a singular purpose: to close the
              communication loop between municipal agencies and the residents
              they serve. We believe that modern governance requires modern toolsets.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              By leveraging advanced AI triage pipelines, real-time location
              aggregation, and democratic budget allocation, we help cities
              identify pain points instantly and execute resolutions transparently.
            </p>

            {/* Pillar list */}
            <ul className="space-y-2.5 pt-2">
              {PILLARS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: "#10b981" }}
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Image with depth frame */}
          <div className="relative">
            {/* Shadow frame offset */}
            <div
              className="absolute inset-0 rounded-2xl translate-x-3 translate-y-3"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
              aria-hidden="true"
            />
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
                minHeight: 340,
              }}
            >
              {/* Actual city image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://i.pinimg.com/1200x/84/68/33/846833ca61b219f54d13582817e38a77.jpg')",
                }}
              />
              {/* Subtle overlay so text could be placed */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(5,11,20,0.55) 100%)",
                }}
              />
              {/* Stat badge overlay */}
              <div
                className="absolute bottom-4 left-4 right-4 rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: "rgba(5,11,20,0.80)",
                  border: "1px solid rgba(52,211,153,0.20)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(16,185,129,0.15)" }}
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: "#34d399" }} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>
                    Live Platform
                  </p>
                  <p className="text-xs font-semibold text-white">
                    Serving 850+ communities across India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
