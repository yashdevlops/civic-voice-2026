"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import PasswordField from "@/components/auth/PasswordField";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreed) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    // Password strength verification
    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLen || !hasUpper || !hasNumber || !hasSpecial) {
      setErrorMsg("Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(name, email || null, phone || null, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = async () => {
    setIsSubmitting(true);
    try {
      await signup("Demo Citizen", "demo@civicvoice.in", null, "Password123!");
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* Left Pane: Full-height city photo panel */}
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
            Empower your community today.
          </h2>
          <p className="text-slate-200 text-xs max-w-sm">
            Sign up to report local issues, vote on civic budgets, and receive direct updates from municipal officers.
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
              Create Your Account
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Join thousands of citizens and be the change.
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="rounded-control bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative flex items-center w-full">

                <input
                  type="text"
                  id="signup-name"
                  placeholder="Your full name"
                  required
                  className="civic-input px-4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative flex items-center w-full">

                <input
                  type="email"
                  id="signup-email"
                  placeholder="name@example.com"
                  required
                  className="civic-input px-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative flex items-center w-full">

                <input
                  type="text"
                  id="signup-phone"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="civic-input px-4"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordField
              value={password}
              onChange={setPassword}
              showStrength={true}
              required={true}
              label="Password"
              id="signup-password"
            />

            {/* Checkbox agreement */}
            <label className="flex items-start gap-2 text-xs font-semibold text-slate-500 cursor-pointer select-none leading-tight py-1">
              <input
                type="checkbox"
                id="signup-agree"
                required
                className="h-4 w-4 rounded-control border-slate-200 text-primary focus:ring-primary accent-primary mt-0.5 shrink-0"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <a href="#terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
                <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Primary Submit */}
            <button
              type="submit"
              id="signup-submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
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
              onClick={handleSocialSignup}
              disabled={isSubmitting}
              className="btn-outline flex items-center justify-center gap-2 py-2 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-bold disabled:opacity-60"
            >
              <span className="font-extrabold text-blue-500">G</span>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={handleSocialSignup}
              disabled={isSubmitting}
              className="btn-outline flex items-center justify-center gap-2 py-2 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-bold disabled:opacity-60"
            >
              <Phone style={{ width: 13, height: 13 }} className="text-slate-400" />
              <span>Phone OTP</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs font-semibold text-slate-500 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
