"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, User, Briefcase, Building2, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { signupMunicipalOfficer } from "@/lib/authStore";
import { MunicipalDeptCode, MUNICIPAL_DEPARTMENTS } from "@/lib/grievance";

function MunicipalSignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [officialId, setOfficialId] = useState("");
  const [designation, setDesignation] = useState("Assistant Engineer");
  const [departmentCode, setDepartmentCode] = useState<MunicipalDeptCode>("roads_potholes");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.toLowerCase().includes("bmc")) {
      setErrorMsg("Official email must be a valid municipal address (e.g. name@bmc.gov.in).");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      signupMunicipalOfficer({
        name,
        email,
        officialId: officialId || `BMC-ENG-${Math.floor(100 + Math.random() * 900)}`,
        designation,
        departmentCode,
      });
      router.push("/municipal/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register municipal officer.");
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
            Official Officer Registration
          </div>
          <h2 className="text-3xl font-extrabold font-display leading-tight">
            Register BMC Department Officer
          </h2>
          <p className="text-slate-300 text-xs max-w-md leading-relaxed">
            Gain verified operational access to your department&apos;s grievance queue, field crew dispatch, and SLA management.
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
                Officer Account Signup
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Create an official profile tied to one of the 6 municipal departments.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block uppercase tracking-wide text-slate-500 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. Priyabrata Mohanty"
                  className="civic-input pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block uppercase tracking-wide text-slate-500 mb-1">Official Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="p.mohanty@bmc.gov.in"
                    className="civic-input pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wide text-slate-500 mb-1">Official Officer ID *</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. BMC-ENG-702"
                    className="civic-input pl-10"
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wide text-slate-500 mb-1">Designation *</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Assistant Executive Engineer"
                  className="civic-input pl-10"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wide text-slate-500 mb-1">Assigned Department *</label>
              <select
                className="w-full font-bold border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-primary cursor-pointer"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value as MunicipalDeptCode)}
              >
                {Object.values(MUNICIPAL_DEPARTMENTS).map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.icon} {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wide text-slate-500 mb-1">Password *</label>
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
              className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Officer Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-semibold">
            Already registered?{" "}
            <Link href="/municipal/login" className="text-primary hover:underline font-bold">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MunicipalSignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading…</div>}>
      <MunicipalSignupForm />
    </Suspense>
  );
}
