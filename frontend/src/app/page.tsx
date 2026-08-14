"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Send,
  LayoutGrid,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  Globe,
  TrendingUp,
  MessageSquare,
  Wrench,
  ChevronRight
} from "lucide-react";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">

      {/* Custom Header for Landing Page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Logo size="md" variant="dark" />

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              {[
                { name: "Home", href: "#home" },
                { name: "About Us", href: "#about" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "Features", href: "#features" },
                { name: "Impact", href: "#impact" },
                { name: "Contact", href: "#contact" },
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${link.name === "Home"
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-slate-600 hover:text-primary"
                    }`}
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-bold text-slate-600 hover:text-primary px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/citizen"
                className="btn-primary py-2 text-xs flex items-center gap-1"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-cover bg-center overflow-hidden flex flex-col justify-center min-h-[90vh]"
        style={{
          backgroundImage: "url('https://i.pinimg.com/1200x/e1/1d/43/e11d43ddba9f60b850cb3d86de575e59.jpg')"
        }}
      >
        <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Main stacked heading */}
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display leading-tight flex flex-col">
              <span>Your Voice.</span>
              <span>Stronger Cities.</span>
              <span className="text-primary-tint inline-flex items-center justify-center gap-2">
                Better Tomorrow.
                {/* SVG underline leaf accent */}
                <svg className="h-6 w-6 stroke-primary-tint fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </span>
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            CivicVoice is an AI-powered platform that helps citizens report issues, track progress, and participate in building better communities.
          </p>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/citizen"
              className="btn-primary px-8 py-3 text-sm flex items-center gap-2 shadow-lg"
            >
              <Send className="h-4 w-4" />
              <span>Report an Issue</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 text-sm font-bold text-white rounded-control border border-white/30 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md flex items-center gap-2 shadow-lg"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Explore Dashboard</span>
            </Link>
          </div>

          {/* Floating Glassmorphic Stat Bar */}
          <div className="pt-12 md:pt-16 max-w-4xl mx-auto">
            <div className="glass-card bg-white/90 p-5 md:p-6 shadow-card-lg border-white/50 backdrop-blur-md grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              {[
                { value: "250K+", label: "Issues Reported", icon: MapPin },
                { value: "120K+", label: "Resolved", icon: CheckCircle2 },
                { value: "850+", label: "Communities", icon: Users },
                { value: "95%", label: "Transparency", icon: ShieldCheck },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-1">
                  <span className="h-9 w-9 rounded-full bg-primary-tint/80 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <stat.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xl md:text-2xl font-extrabold text-slate-800 font-display">
                    {stat.value}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
                About Our Mission
              </span>
              <h2 className="text-3xl font-extrabold text-slate-800 font-display">
                Connecting Citizens and Local Authorities Seamlessly
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                CivicVoice was founded with a singular purpose: to close the communication loop between municipal agencies and the residents they serve. We believe that modern governance requires modern toolsets.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                By leveraging advanced AI triage pipelines, real-time location aggregation, and democratic budget allocations, we help cities identify pain points instantly and execute resolutions transparently.
              </p>
            </div>

            <div className="rounded-card overflow-hidden border border-slate-100 shadow-lg relative min-h-[300px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://i.pinimg.com/1200x/84/68/33/846833ca61b219f54d13582817e38a77.jpg')"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
              Workflow Overview
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 font-display">
              Three Simple Steps to Make a Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Report Issues Easily",
                desc: "Record a voice memo, type a short message, or capture a photo. Our AI identifies category, priority, and location auto-detects coordinates.",
              },
              {
                step: "02",
                title: "Smart Aggregation",
                desc: "ChromaDB maps duplicates within a 100m radius, adding your support to existing tickets to prevent duplicate spam and show community weight.",
              },
              {
                step: "03",
                title: "Track & Resolve",
                desc: "Follow the active resolution timeline. Review real photos uploaded by city officers proving that the work has been completed.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-card border border-slate-100 shadow-sm space-y-4 text-left">
                <span className="text-3xl font-extrabold text-primary/20 font-display">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
              System Capability
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 font-display">
              Advanced Tools for Modern Municipalities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                title: "Speech-to-Text Triage",
                desc: "Whisper integration processes voice complaints in regional languages and summarizes details instantly.",
                icon: Globe
              },
              {
                title: "Participatory Budgeting",
                desc: "Vote on local project proposals directly to impact the allocation of municipal municipal resources.",
                icon: TrendingUp
              },
              {
                title: "Direct Messages",
                desc: "Communicate with specific departments like Roads, Waste Management, or BWSSB directly in-app.",
                icon: MessageSquare
              },
              {
                title: "Evidence Validation",
                desc: "Resolution requires photographic upload evidence, ensuring true execution before tickets close.",
                icon: Wrench
              },
            ].map((f, idx) => (
              <div key={idx} className="p-5 border border-slate-100 rounded-card bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
                <span className="h-9 w-9 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-800">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
              Measurable Success
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 font-display">
              Transforming Cities, One Block at a Time
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: "250K+ Issues Tackled", desc: "Thousands of potholes filled, garbage dumps cleared, and streetlights repaired across urban neighborhoods." },
              { title: "SLA Response: 4.2 Days", desc: "Average response time dropped significantly since the introduction of auto-routing categorization AI." },
              { title: "92% Resolution Compliance", desc: "Transparency controls ensure that nearly all submitted issues are verified and completed." },
            ].map((imp, idx) => (
              <div key={idx} className="bg-white p-6 rounded-card border border-slate-100 shadow-sm space-y-2">
                <h3 className="text-base font-bold text-slate-800">
                  {imp.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {imp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
              Get in Touch
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 font-display">
              Ready to Empower Your Municipality?
            </h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
              Contact our product team to schedule a demo deployment for your ward, municipality, or town assembly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:yashdeo01@gmail.com" className="btn-primary px-6 py-2.5 text-xs">
              Email Support
            </a>
            <a href="tel:+9180000000" className="btn-outline px-6 py-2.5 text-xs">
              Call Hotline
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />


    </div>
  );
}
