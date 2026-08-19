"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Building2 } from "lucide-react";
import Logo from "@/components/Logo";
import { loginMunicipalOfficer } from "@/lib/authStore";

function MunicipalLoginForm() {
  const router = useRouter();
  const [emailOrId, setEmailOrId] = useState("roads.officer@bmc.gov.in");
  const [password, setPassword] = useState("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 400));
      loginMunicipalOfficer(emailOrId, password);
      router.push("/municipal/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate municipal officer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      {/* Left Pane */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center items-start p-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1000')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60" />
        <Link href="/" className="relative z-10 block">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40 shadow-lg flex items-center gap-2">
            <Logo size="sm" variant="dark" href="/" />
          </div>
        </Link>
        <div className="absolute bottom-10 left-10 right-10 text-white z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            Bhubaneswar Municipal Corporation
          </div>
          <h2 className="text-3xl font-extrabold font-display leading-tight">
            Municipal Operational Engine
          </h2>
          <p className="text-slate-300 text-xs max-w-md leading-relaxed">
            Scoped queue triage, field crew assignment, SLA tracking, and proof-of-work resolution for department engineers.
          </p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-800 font-display">
                Municipal Officer Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Log in with your official BMC Department credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Quick Demo Pre-fill Hint */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 space-y-1">
            <p className="font-bold uppercase tracking-wider text-[10px]">💡 Demo Accounts (click to test):</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "Roads", email: "roads.officer@bmc.gov.in" },
                { label: "Water", email: "water.officer@bmc.gov.in" },
                { label: "Electrical", email: "electrical.officer@bmc.gov.in" },
                { label: "Cleanliness", email: "cleanliness.officer@bmc.gov.in" },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setEmailOrId(d.email)}
                  className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Official Email or Officer ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="roads.officer@bmc.gov.in or BMC-ENG-701"
                  className="civic-input pl-10"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="civic-input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Access Operational Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-semibold">
            New Department Officer?{" "}
            <Link href="/municipal/signup" className="text-primary hover:underline font-bold">
              Register Official ID
            </Link>
          </p>

          <div className="text-center pt-2">
            <Link href="/commissioner/login" className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
              Looking for Commissioner Portal? Click here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MunicipalLoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading…</div>}>
      <MunicipalLoginForm />
    </Suspense>
  );
}
