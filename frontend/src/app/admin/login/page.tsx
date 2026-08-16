"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowRight, Key, UserCheck, Lock, Building2 } from "lucide-react";
import Logo from "@/components/Logo";
import PasswordField from "@/components/auth/PasswordField";
import { attemptAdminLogin, ADMIN_SESSION_KEY, getAdminSession, seedOfficersIfEmpty } from "@/lib/officerRegistry";
import { OfficerSession } from "@/lib/types";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [officialEmail, setOfficialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Mount logic
  useEffect(() => {
    seedOfficersIfEmpty();

    // Check if session already exists and is valid
    const existingSession = getAdminSession();
    if (existingSession) {
      router.replace("/admin/dashboard");
      return;
    }

    // Prefill from query param
    const prefill = searchParams.get("email");
    if (prefill) {
      setOfficialEmail(prefill);
    }
  }, [searchParams, router]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      if (currentNow >= new Date(lockedUntil).getTime()) {
        setLockedUntil(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil ? new Date(lockedUntil).getTime() > now : false;
  const remainingMs = lockedUntil ? new Date(lockedUntil).getTime() - now : 0;

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await attemptAdminLogin(officialEmail, password);
      if (!result.ok) {
        if (result.reason === "not_found") {
          setErrorMessage(
            <span>
              No officer account found with this email.{" "}
              <Link href="/admin/signup" className="underline font-extrabold text-amber-700">
                Sign up first
              </Link>
              .
            </span>
          );
        } else if (result.reason === "wrong_password") {
          setErrorMessage("Incorrect password.");
        } else if (result.reason === "locked") {
          setLockedUntil(result.lockedUntil || new Date(Date.now() + 2 * 60 * 1000).toISOString());
        }
      } else {
        const session: OfficerSession & { officialEmail: string } = {
          officerId: result.user.officerId,
          officialEmail: result.user.officialEmail,
          role: result.user.role,
          token: `token_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        router.push("/admin/dashboard");
      }
    } catch {
      setErrorMessage("Officer login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginFill = (emailVal: string) => {
    setOfficialEmail(emailVal);
    setPassword("Admin@123");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-slate-950">

      {/* Left Full-Bleed Image Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: "url('https://i.pinimg.com/1200x/2f/30/26/2f302689882ab91b0f175561330c9483.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
            Officer Portal Gateway
          </span>
        </div>

        {/* Bottom Banner Title */}
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            <span>Municipal Control Center</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold font-display leading-tight text-white">
            Real-Time Grievance Triage & Resolution Gateway
          </h2>
          <p className="text-slate-300 text-sm max-w-lg leading-relaxed font-medium">
            Authorized municipal officers access live ward complaints, assign field teams, monitor SLA compliance, and dispatch resolution updates.
          </p>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 min-h-screen overflow-y-auto">
        
        {/* Top Header Nav for Mobile & Desktop */}
        <div className="flex items-center justify-between w-full pb-6 border-b border-slate-100">
          <Logo size="md" variant="dark" href="/" />
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Form Body */}
        <div className="w-full max-w-[440px] mx-auto py-8 space-y-6">
          {/* Header Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Officer Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              Officer Authentication
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your government credentials to access the administrative portal
            </p>
          </div>

          {/* Lockout Notice */}
          {isLocked && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 font-semibold flex items-center gap-2 animate-pulse">
              <Lock className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Account locked. Try again in {formatCountdown(remainingMs)}.</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !isLocked && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 font-bold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Email
              </label>
              <input
                type="email"
                id="login-email"
                placeholder="officer@civicvoice.gov.in"
                required
                disabled={isLocked || loading}
                className="civic-input px-4 font-semibold text-slate-800"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              showStrengthMeter={false}
              id="login-password"
            />

            {/* Quick Demo Login Cards */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-600" />
                  <span>Quick Demo Logins</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">Click to fill</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLoginFill("yashdeo1@civicvoice.gov.in")}
                  className="w-full text-left bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 p-3 rounded-xl transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center border border-amber-300">
                      YD
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">YASH DEO</p>
                      <p className="text-[10px] font-semibold text-slate-400">yashdeo1@civicvoice.gov.in</p>
                    </div>
                  </div>
                  <UserCheck className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLoginFill("admin@civicvoice.gov.in")}
                  className="w-full text-left bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 p-3 rounded-xl transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-300">
                      AS
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Aditya Sharma</p>
                      <p className="text-[10px] font-semibold text-slate-400">admin@civicvoice.gov.in</p>
                    </div>
                  </div>
                  <UserCheck className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Officer Credentials…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure Officer Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center pt-2">
            <Link
              href="/admin/signup"
              className="text-xs text-slate-500 hover:text-amber-700 font-bold transition-colors"
            >
              Need an officer account? <span className="text-amber-600 underline">Register here →</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-semibold pt-6 border-t border-slate-100">
          CivicVoice Officer Administrative Portal • Authorized Personnel Only
        </div>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
