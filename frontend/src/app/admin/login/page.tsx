"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowRight, Mail, Key } from "lucide-react";
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

  // Calculate if currently locked
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
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

  // Auto-fill developer demo credentials helper (no auto-submit)
  const handleQuickLoginFill = (emailVal: string) => {
    setOfficialEmail(emailVal);
    setPassword("Admin@123");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Left Scrim Banner */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center items-start p-10"
        style={{
          backgroundImage: "url('https://i.pinimg.com/736x/4c/e5/0e/4ce50ea97b13404f9ef3188f55fcf538.jpg')"
        }}
      >
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-card border border-white/40 shadow-lg flex items-center gap-1.5">
          <Logo size="sm" variant="dark" />
        </div>

        <div className="absolute bottom-10 left-10 right-10 text-white z-10 space-y-2">
          <h2 className="text-2xl font-extrabold font-display leading-tight text-white border-l-4 border-amber-600 pl-4">
            Municipal Portal
          </h2>
          <p className="text-slate-300 text-xs max-w-sm">
            Access secure dashboard elements to triage and assign community requests.
          </p>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative">
        <div className="lg:hidden absolute top-6 left-6">
          <Logo size="sm" variant="dark" />
        </div>

        <div className="w-full max-w-[440px] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                <ShieldCheck className="text-amber-600 h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 font-display leading-tight">
                  Officer Authentication
                </h1>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Admin Gateway Only
                </p>
              </div>
            </div>
          </div>

          {/* Locked status countdown */}
          {isLocked && (
            <div className="rounded-control bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 font-semibold animate-pulse" role="alert">
              Account locked. Try again in {formatCountdown(remainingMs)}.
            </div>
          )}

          {/* Generic Error message banner */}
          {errorMessage && !isLocked && (
            <div className="rounded-control bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-semibold font-bold" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-slate-600">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Official Email
              </label>
              <div className="relative flex items-center w-full">
                <Mail className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                <input
                  type="email"
                  id="login-email"
                  placeholder="officer@civicvoice.gov.in"
                  required
                  disabled={isLocked || loading}
                  className="civic-input pl-11"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              showStrengthMeter={false}
              id="login-password"
            />

            {/* Quick Demo Login Box */}
            {/* Remove this hint box before any real deployment. */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5">
              <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[9px] text-amber-800 flex items-center gap-1.5 leading-none">
                <Key className="h-3.5 w-3.5 shrink-0" />
                <span>Quick Demo Login Buttons</span>
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLoginFill("yashdeo1@civicvoice.gov.in")}
                  className="w-full text-left bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-200 p-2.5 rounded-lg transition-all leading-normal flex flex-col cursor-pointer"
                >
                  <span className="font-extrabold text-slate-800 text-[10px]">YASH DEO (Admin)</span>
                  <span className="font-mono text-[9px] text-slate-450 text-slate-500">yashdeo1@civicvoice.gov.in / Admin@123</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleQuickLoginFill("admin@civicvoice.gov.in")}
                  className="w-full text-left bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-200 p-2.5 rounded-lg transition-all leading-normal flex flex-col cursor-pointer"
                >
                  <span className="font-extrabold text-slate-800 text-[10px]">Aditya Sharma (Admin)</span>
                  <span className="font-mono text-[9px] text-slate-450 text-slate-500">admin@civicvoice.gov.in / Admin@123</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-control bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Officer Registration Link */}
            <div className="text-center pt-2 font-bold">
              <Link
                href="/admin/signup"
                className="text-[11px] text-slate-400 hover:text-amber-700 font-semibold transition-colors"
              >
                Register as a new officer →
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-amber-600" /></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
