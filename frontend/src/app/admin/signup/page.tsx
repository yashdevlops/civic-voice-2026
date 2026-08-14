"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Send } from "lucide-react";
import Logo from "@/components/Logo";
import PasswordField, { getPasswordRuleStatus } from "@/components/auth/PasswordField";
import { isOfficerIdTaken, isEmailTaken, registerOfficer, seedOfficersIfEmpty } from "@/lib/officerRegistry";

function AdminSignupForm() {
  const router = useRouter();

  // Registration code gating removed for ease of local testing — reintroduce before any real deployment.

  // Form input states
  const [name, setName] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmedAccurate, setConfirmedAccurate] = useState(false);

  // Status and error states
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [officerIdError, setOfficerIdError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Seed on startup + suggest unique Officer ID
  useEffect(() => {
    seedOfficersIfEmpty();
    
    // Suggest a unique Officer ID
    let randomDigits = Math.floor(1000 + Math.random() * 9000);
    let suggestion = `OFF-${randomDigits}`;
    let safetyCounter = 100;
    
    while (isOfficerIdTaken(suggestion) && safetyCounter > 0) {
      randomDigits = Math.floor(1000 + Math.random() * 9000);
      suggestion = `OFF-${randomDigits}`;
      safetyCounter--;
    }
    setOfficerId(suggestion);
  }, []);

  // Phone input normalizer
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.startsWith("91") && clean.length > 10) {
      clean = clean.slice(2);
    }
    if (clean.length > 10) {
      clean = clean.slice(-10);
    }
    setPhone(clean);
  };

  // Inline Validation checks
  const handleOfficerIdBlur = () => {
    const cleanId = officerId.trim().toUpperCase();
    if (!cleanId) {
      setOfficerIdError("Officer ID is required.");
      return;
    }
    if (!/^OFF-\d{1,6}$/.test(cleanId)) {
      setOfficerIdError("Officer ID must start with OFF- followed by 1 to 6 digits.");
      return;
    }
    if (isOfficerIdTaken(cleanId)) {
      setOfficerIdError("This Officer ID is already registered. Try a different one.");
      return;
    }
    setOfficerIdError("");
  };

  const handleEmailBlur = () => {
    const cleanEmail = officialEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailError("Email address is required.");
      return;
    }
    if (isEmailTaken(cleanEmail)) {
      setEmailError("An account with this email already exists.");
      return;
    }
    setEmailError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setOfficerIdError("");
    setEmailError("");

    const cleanId = officerId.trim().toUpperCase();
    const cleanEmail = officialEmail.trim().toLowerCase();

    // Frontend pre-submit validations
    if (name.trim().length < 2) {
      setSubmitError("Name must be at least 2 characters.");
      return;
    }

    if (!/^OFF-\d{1,6}$/.test(cleanId)) {
      setOfficerIdError("Officer ID must start with OFF- followed by 1 to 6 digits.");
      return;
    }

    const { score } = getPasswordRuleStatus(password);
    if (score < 4) {
      setSubmitError("Password does not meet all secure guidelines.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerOfficer({
        name: name.trim(),
        officerId: cleanId,
        officialEmail: cleanEmail,
        phone: phone ? `+91${phone}` : null,
        password: password,
      });

      if (!result.ok) {
        if (result.reason === "officer_id_taken") {
          setOfficerIdError("This Officer ID is already registered. Try a different one.");
        } else if (result.reason === "email_taken") {
          setEmailError("An account with this email already exists.");
        }
        setLoading(false);
        return;
      }

      // Success redirect
      router.push(`/admin/login?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: any) {
      setSubmitError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const isEmailDomainWarning =
    officialEmail.trim().length > 0 &&
    !/@civicvoice\.gov\.in$/.test(officialEmail.trim().toLowerCase());

  const { score: passwordScore } = getPasswordRuleStatus(password);
  
  // Submit is allowed only when format validations pass
  const isFormValid =
    name.trim().length >= 2 &&
    /^OFF-\d{1,6}$/.test(officerId.trim().toUpperCase()) &&
    officialEmail.trim().length > 0 &&
    passwordScore === 4 &&
    password === confirmPassword;

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="sm" variant="dark" href="/" />
            
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Already registered? Log in →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-[480px] bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-extrabold text-slate-800 font-display flex items-center justify-center gap-1.5">
              <span>Officer Registration</span>
              <ShieldCheck className="h-5 w-5 text-amber-600" />
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Fill in the secure fields below to register as a municipal administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold" role="alert">
                {submitError}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                id="signup-name"
                required
                placeholder="e.g. Priya Sharma"
                className="civic-input px-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Officer ID */}
            <div className="space-y-1.5">
              <label htmlFor="signup-officer-id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Officer ID
              </label>
              <input
                type="text"
                id="signup-officer-id"
                required
                placeholder="e.g. OFF-1001"
                className="civic-input px-4 font-mono uppercase"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                onBlur={handleOfficerIdBlur}
              />
              {officerIdError && (
                <p className="text-xs text-red-650 text-red-600 font-bold" role="alert">
                  {officerIdError}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Official Email
              </label>
              <input
                type="email"
                id="signup-email"
                required
                placeholder="officer@civicvoice.gov.in"
                className="civic-input px-4"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                onBlur={handleEmailBlur}
              />
              {emailError && (
                <p className="text-xs text-red-650 font-bold" role="alert">
                  {emailError}
                  {emailError.includes("already exists") && (
                    <>
                      {" "}
                      <Link href="/admin/login" className="underline text-amber-700">
                        Log in instead?
                      </Link>
                    </>
                  )}
                </p>
              )}
              {isEmailDomainWarning && !emailError && (
                <p className="text-xs text-amber-600 font-bold" role="status">
                  Tip: officer accounts normally use a @civicvoice.gov.in address — you can still continue for testing.
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="signup-phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Mobile Number (Optional)
              </label>
              <div className="relative flex items-center w-full">
                <span className="absolute left-3.5 text-slate-400 font-bold text-sm select-none">+91</span>
                <input
                  type="tel"
                  id="signup-phone"
                  placeholder="98765 43210"
                  className="civic-input pl-12"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="space-y-3">
              <PasswordField
                label="New Password"
                value={password}
                onChange={setPassword}
                showStrengthMeter={true}
                id="signup-password"
              />

              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showStrengthMeter={false}
                id="signup-confirm-password"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-650 font-bold" role="alert">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Confirmed Accurate Checkbox (visual only - not gated) */}
            <label className="flex items-start gap-2 text-xs font-semibold text-slate-500 cursor-pointer select-none leading-tight py-1">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-control border-slate-200 text-amber-600 focus:ring-amber-500 accent-amber-600 mt-0.5 shrink-0"
                checked={confirmedAccurate}
                onChange={(e) => setConfirmedAccurate(e.target.checked)}
              />
              <span>
                I confirm I am an authorized municipal official and the information above is accurate.
              </span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-3 rounded-control bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering Account…</span>
                </>
              ) : (
                <>
                  <Send className="h-4.5 w-4.5" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400 mt-auto">
        <p>© {new Date().getFullYear()} CivicVoice. Administrative Registration Security Gate.</p>
      </footer>
    </div>
  );
}

export default function AdminSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-amber-600" /></div>}>
      <AdminSignupForm />
    </Suspense>
  );
}
