"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Mail, KeyRound, User, Briefcase, ArrowRight, Loader2, Award } from "lucide-react";
import Logo from "@/components/Logo";
import { signupCommissioner, COMMISSIONER_PASSCODE } from "@/lib/authStore";

function CommissionerSignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [designation, setDesignation] = useState("Municipal Commissioner");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (passcode !== COMMISSIONER_PASSCODE) {
      setErrorMsg(`Invalid Clearance Passcode. Expected: ${COMMISSIONER_PASSCODE}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      signupCommissioner({
        name,
        email,
        clearancePasscode: passcode,
        designation,
      });
      router.push("/commissioner/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register Commissioner account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-900 text-white">
      {/* Left Pane */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center items-start p-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=1000')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/75" />
        <Link href="/" className="relative z-10 block">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg flex items-center gap-2">
            <Logo size="sm" variant="dark" href="/" />
          </div>
        </Link>
        <div className="absolute bottom-10 left-10 right-10 z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" />
            Executive Authorization
          </div>
          <h2 className="text-3xl font-extrabold font-display leading-tight text-white">
            Register Commissioner Credentials
          </h2>
          <p className="text-slate-300 text-xs max-w-md leading-relaxed">
            Authorized signup for Municipal Commissioners, Additional Commissioners, and City Directors.
          </p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-900">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Globe className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-extrabold text-white font-display">
                Commissioner Registration
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Passcode verification required ({COMMISSIONER_PASSCODE}).
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-900/50 border border-red-500/50 p-3 text-xs text-red-200 font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-300">
            <div>
              <label className="block uppercase tracking-wide text-slate-400 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Dr. Vijay Amruta Kulange (IAS)"
                  className="w-full text-xs font-semibold border border-slate-700 bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wide text-slate-400 mb-1.5">Government Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="commissioner@bmc.gov.in"
                  className="w-full text-xs font-semibold border border-slate-700 bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wide text-slate-400 mb-1.5">Designation *</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Municipal Commissioner"
                  className="w-full text-xs font-semibold border border-slate-700 bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wide text-slate-400 mb-1.5">Clearance Passcode *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="BMC-COMM-2026"
                  className="w-full text-xs font-semibold border border-slate-700 bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center py-3 text-sm font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Create Commissioner Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 font-semibold">
            Already have access?{" "}
            <Link href="/commissioner/login" className="text-amber-400 hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CommissionerSignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading…</div>}>
      <CommissionerSignupForm />
    </Suspense>
  );
}
