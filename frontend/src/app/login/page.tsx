"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Loader2, ShieldCheck, HelpCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import Modal from "@/components/auth/Modal";
import OtpInput from "@/components/auth/OtpInput";
import PasswordField from "@/components/auth/PasswordField";

// Soft throttling state keys
const CITIZEN_FAILED_KEY = "civic_voice_citizen_failed_attempts";
const CITIZEN_LOCK_KEY = "civic_voice_citizen_lock_until";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle, loginWithOtp, verifyIdentifier, resetPassword } = useAuth();

  // ── Form State ─────────────────────────────────────────────────────────────
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Throttling Lockout State ───────────────────────────────────────────────
  const [lockoutTime, setLockoutTime] = useState<number>(0); // remaining seconds
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lockUntil = localStorage.getItem(CITIZEN_LOCK_KEY);
    if (lockUntil) {
      const remaining = Math.ceil((new Date(lockUntil).getTime() - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutTime(remaining);
      } else {
        localStorage.removeItem(CITIZEN_LOCK_KEY);
        localStorage.removeItem(CITIZEN_FAILED_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(CITIZEN_LOCK_KEY);
          localStorage.removeItem(CITIZEN_FAILED_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const recordFailedAttempt = () => {
    const attempts = parseInt(localStorage.getItem(CITIZEN_FAILED_KEY) || "0", 10) + 1;
    localStorage.setItem(CITIZEN_FAILED_KEY, attempts.toString());
    if (attempts >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 1000).toISOString();
      localStorage.setItem(CITIZEN_LOCK_KEY, lockUntil);
      setLockoutTime(30);
    }
  };

  // ── Modal Toggle States ──────────────────────────────────────────────────
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // ── Password Submit Handler ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;
    
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(emailOrPhone, password, rememberMe);
      localStorage.removeItem(CITIZEN_FAILED_KEY);
      localStorage.removeItem(CITIZEN_LOCK_KEY);
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/dashboard");
    } catch (err: any) {
      recordFailedAttempt();
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Simulated Google OAuth Modal Flow ──────────────────────────────────────
  const [googleStep, setGoogleStep] = useState<"pick" | "setPassword">("pick");
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState("");
  const [selectedGoogleName, setSelectedGoogleName] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const handleGoogleSelect = async (email: string, name: string) => {
    setGoogleLoading(true);
    setSelectedGoogleEmail(email);
    setSelectedGoogleName(name);
    
    try {
      const { isNew } = await loginWithGoogle(email, name);
      if (isNew) {
        setGoogleStep("setPassword");
      } else {
        setIsGoogleModalOpen(false);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsGoogleModalOpen(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleLoading(true);
    try {
      await resetPassword(selectedGoogleEmail, googlePassword);
      setIsGoogleModalOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Simulated Phone OTP Modal Flow ──────────────────────────────────────────
  const [otpStep, setOtpStep] = useState<"phone" | "verify">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [otpResendTimer, setOtpResendTimer] = useState<number>(0);
  const [otpError, setOtpError] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpResendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phoneInput)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setOtpLoading(true);
    // Simulate sending OTP
    await new Promise((res) => setTimeout(res, 600));
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpSent(randomCode);
    setOtpExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes
    setOtpResendTimer(30);
    
    // Simulate SMS delivery via console and a temporary mock toast
    console.log(`[SMS OTP] Code sent to +91${phoneInput}: ${randomCode}`);
    const toast = document.createElement("div");
    toast.className = "fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 text-sm font-semibold rounded-xl border border-slate-700 shadow-2xl z-[999] animate-bounce";
    toast.innerHTML = `💬 [SMS Simulator] Your CivicVoice OTP is: <strong class="text-green-400 font-mono">${randomCode}</strong>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 7000);

    setOtpStep("verify");
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    setOtpError(false);
    if (Date.now() > otpExpiry) {
      alert("This code has expired, please request a new one.");
      return;
    }

    if (otpCode !== otpSent) {
      setOtpError(true);
      return;
    }

    setOtpLoading(true);
    try {
      await loginWithOtp(phoneInput);
      setIsOtpModalOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Forgot Password 4-Step Modal Flow ──────────────────────────────────────
  const [forgotStep, setForgotStep] = useState<"identify" | "verify" | "reset" | "confirm">("identify");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [confirmForgotPassword, setConfirmForgotPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleForgotIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const exists = await verifyIdentifier(forgotIdentifier);
      if (!exists) {
        setForgotError("No account found with this identifier.");
      } else {
        setForgotStep("verify");
      }
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifySimulated = async () => {
    setForgotLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    setForgotStep("reset");
    setForgotLoading(false);
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotPassword !== confirmForgotPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotIdentifier, forgotPassword);
      setForgotStep("confirm");
      setTimeout(() => {
        setIsForgotModalOpen(false);
        // Prefill email field
        setEmailOrPhone(forgotIdentifier);
      }, 2500);
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Left Pane: Full-height city park photo panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center items-start p-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=1000')"
        }}
      >
        <div className="absolute inset-0 bg-slate-950/50" />

        {/* Floating Logo overlay top-left */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-card border border-white/40 shadow-lg flex items-center gap-1.5">
          <Logo size="sm" variant="dark" />
        </div>

        <div className="absolute bottom-10 left-10 right-10 text-white z-10 space-y-2">
          <h2 className="text-2xl font-extrabold font-display leading-tight">
            Be the change in your neighborhood.
          </h2>
          <p className="text-slate-200 text-xs max-w-sm">
            CivicVoice aggregates reports in real time to guide municipal resources where they are needed most.
          </p>
        </div>
      </div>

      {/* Right Pane: centered form card */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative">
        {/* Mobile top logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Logo size="sm" variant="dark" />
        </div>

        <div className="w-full max-w-[440px] space-y-6">

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-slate-800 font-display flex items-center gap-2">
              Welcome Back!
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Log in to continue making your city better.
            </p>
          </div>

          {/* Lockout / Throttling Alert */}
          {lockoutTime > 0 && (
            <div className="rounded-control bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 font-semibold animate-pulse">
              Too many failed login attempts. Submit disabled for {lockoutTime} seconds.
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="rounded-control bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-semibold" role="alert">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email/Phone */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Email or Phone
              </label>
              <div className="relative flex items-center w-full">
                <Mail className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  id="login-email"
                  placeholder="name@example.com or +91..."
                  required
                  disabled={lockoutTime > 0}
                  className="civic-input pl-11"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordField
              value={password}
              onChange={setPassword}
              showStrength={false}
              required={true}
              disabled={lockoutTime > 0}
              label="Password"
              id="login-password"
            />

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="login-remember"
                  className="h-4 w-4 rounded-control border-slate-200 text-primary focus:ring-primary accent-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotStep("identify");
                  setForgotIdentifier("");
                  setForgotPassword("");
                  setConfirmForgotPassword("");
                  setForgotError(null);
                  setIsForgotModalOpen(true);
                }}
                className="text-primary hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isSubmitting || lockoutTime > 0}
              className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100" />
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-100" />
          </div>

          {/* Social Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setGoogleStep("pick");
                setGooglePassword("");
                setIsGoogleModalOpen(true);
              }}
              disabled={isSubmitting}
              className="btn-outline flex items-center justify-center gap-2 py-2.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-bold disabled:opacity-60"
            >
              <span className="font-extrabold text-blue-500 text-sm">G</span>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpStep("phone");
                setPhoneInput("");
                setOtpCode("");
                setOtpError(false);
                setIsOtpModalOpen(true);
              }}
              disabled={isSubmitting}
              className="btn-outline flex items-center justify-center gap-2 py-2.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-bold disabled:opacity-60"
            >
              <Phone style={{ width: 14, height: 14 }} className="text-slate-400" />
              <span>Phone OTP</span>
            </button>
          </div>

          {/* Admin Portal Link */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <ShieldCheck style={{ width: 13, height: 13 }} className="text-slate-400" />
            <Link href="/login/admin" className="text-[11px] text-slate-400 hover:text-primary font-semibold transition-colors">
              Municipal Officer / Admin Login →
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-400 leading-relaxed font-medium">
            By continuing, you agree to our{" "}
            <a href="#terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>

          <p className="text-center text-xs font-semibold text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* ── Google Sign-in Mock Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        title="Sign in with Google"
      >
        {googleStep === "pick" ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Choose an account to continue to CivicVoice</p>
            <div className="space-y-2">
              <button
                onClick={() => handleGoogleSelect("citizen@example.com", "Priyanshu Chandra")}
                disabled={googleLoading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">PC</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Priyanshu Chandra</p>
                  <p className="text-xs text-slate-500">citizen@example.com</p>
                </div>
              </button>
              <button
                onClick={() => handleGoogleSelect("new.citizen@example.com", "New Civic User")}
                disabled={googleLoading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">NC</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">New Civic User</p>
                  <p className="text-xs text-slate-500">new.citizen@example.com</p>
                </div>
              </button>
            </div>
            {googleLoading && (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleGoogleSetPassword} className="space-y-4">
            <div className="rounded-xl bg-green-50 p-4 border border-green-200 text-xs text-green-800 font-medium">
              🎉 Registration successful via Google! Set a password below for fallback login later (optional).
            </div>
            <PasswordField
              value={googlePassword}
              onChange={setGooglePassword}
              showStrength={true}
              required={true}
              label="Set fallback Password"
              id="google-fallback-password"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="btn-ghost border border-slate-200 text-xs py-2 px-4"
              >
                Skip & Finish
              </button>
              <button
                type="submit"
                disabled={googleLoading}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save & Continue
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Phone OTP Mock Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title="Sign in with Mobile OTP"
      >
        {otpStep === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="otp-phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Mobile Number
              </label>
              <div className="relative flex items-center w-full">
                <span className="absolute left-3.5 text-slate-400 font-bold text-sm select-none">+91</span>
                <input
                  type="tel"
                  id="otp-phone"
                  required
                  placeholder="98765 43210"
                  pattern="^[6-9]\d{9}$"
                  className="civic-input pl-12"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={otpLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs flex items-center gap-1.5"
            >
              {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send OTP Verification Code
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="space-y-1 text-slate-600">
              <p className="text-sm font-semibold">Enter verification code</p>
              <p className="text-xs">We sent a 6-digit OTP code to <strong className="text-slate-800 font-mono">+91 {phoneInput}</strong></p>
            </div>

            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              error={otpError}
            />

            {otpError && (
              <p className="text-xs text-red-500 font-semibold animate-pulse">Incorrect OTP verification code. Please check and try again.</p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpCode.length < 6}
                className="btn-primary w-full justify-center py-2.5 text-xs flex items-center gap-1.5"
              >
                {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify & Sign In
              </button>

              <div className="flex justify-between items-center text-xs px-2 pt-1 font-semibold">
                <button
                  type="button"
                  onClick={() => setOtpStep("phone")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  disabled={otpResendTimer > 0}
                  onClick={handleSendOtp}
                  className="text-primary disabled:text-slate-400 transition-colors"
                >
                  {otpResendTimer > 0 ? `Resend OTP in ${otpResendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Forgot Password 4-Step Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset your password"
      >
        {forgotStep === "identify" && (
          <form onSubmit={handleForgotIdentify} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">Enter your registered email address or phone number to look up your citizen profile.</p>
            {forgotError && (
              <div className="rounded-control bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-semibold" role="alert">
                {forgotError}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="forgot-id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Email or Mobile Number
              </label>
              <div className="relative flex items-center w-full">
                <Mail className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  id="forgot-id"
                  placeholder="name@example.com or 9876543210"
                  required
                  className="civic-input pl-11"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs flex items-center gap-1.5"
            >
              {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Search Citizen Account
            </button>
          </form>
        )}

        {forgotStep === "verify" && (
          <div className="space-y-5 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">We found your citizen profile! Click below to send a simulated password reset OTP verification code to your registered line.</p>
            <button
              type="button"
              onClick={handleForgotVerifySimulated}
              disabled={forgotLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs flex items-center gap-1.5"
            >
              {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send Reset Code & Proceed
            </button>
          </div>
        )}

        {forgotStep === "reset" && (
          <form onSubmit={handleForgotReset} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">Enter and confirm your new secure password below.</p>
            {forgotError && (
              <div className="rounded-control bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-semibold" role="alert">
                {forgotError}
              </div>
            )}
            <PasswordField
              value={forgotPassword}
              onChange={setForgotPassword}
              showStrength={true}
              required={true}
              label="New Password"
              id="forgot-pass-1"
            />
            <PasswordField
              value={confirmForgotPassword}
              onChange={setConfirmForgotPassword}
              showStrength={false}
              required={true}
              label="Confirm New Password"
              id="forgot-pass-2"
            />
            <button
              type="submit"
              disabled={forgotLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs flex items-center gap-1.5"
            >
              {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save New Password
            </button>
          </form>
        )}

        {forgotStep === "confirm" && (
          <div className="py-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200">
              ✓
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Password Reset Successful!</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Your password has been changed. You will now be redirected to the login panel.</p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-slate-400 text-sm">Loading…</span></div>}>
      <LoginForm />
    </Suspense>
  );
}
