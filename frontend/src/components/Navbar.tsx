"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShieldCheck, Globe, User, LogOut, Building2, Briefcase, Gavel } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { getMunicipalSession, getCommissionerSession, clearMunicipalSession, clearCommissionerSession, AuthUser } from "@/lib/authStore";
import { useContractsStore } from "@/lib/contractsStore";

export default function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const { tenders } = useContractsStore();
  const openTendersCount = (tenders || []).filter((t) => t.status === "OPEN_FOR_BIDDING").length;

  const [muniUser, setMuniUser] = useState<AuthUser | null>(null);
  const [commUser, setCommUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setMuniUser(getMunicipalSession());
    setCommUser(getCommissionerSession());
  }, [pathname]);

  // Don't render global Navbar inside main dashboard layout if covered by DashboardShell
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleMunicipalLogout = () => {
    clearMunicipalSession();
    setMuniUser(null);
    router.push("/municipal/login");
  };

  const handleCommissionerLogout = () => {
    clearCommissionerSession();
    setCommUser(null);
    router.push("/commissioner/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" variant="dark" />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/citizen"
              className={cn(
                "px-3.5 py-2 text-xs font-bold transition-all rounded-full flex items-center gap-1.5 border",
                pathname.startsWith("/citizen")
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Citizen Portal</span>
            </Link>

            {/* Civic Credit Balance Pill */}
            <Link
              href="/dashboard/civic-credits"
              title="Civic Credits & Rewards Wallet"
              className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-extrabold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
            >
              <span>🌱 175 Credits</span>
            </Link>

            {/* Municipal Officer Portal */}
            {muniUser ? (
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-full px-3.5 py-1.5 text-xs font-bold text-indigo-900">
                <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                <Link href="/municipal/dashboard" className="hover:underline">
                  Municipal: {muniUser.name.split(" ")[0]}
                </Link>
                <button
                  onClick={handleMunicipalLogout}
                  className="ml-1 text-slate-400 hover:text-red-600 p-0.5 rounded"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/municipal/login"
                className={cn(
                  "px-3.5 py-2 text-xs font-bold transition-all rounded-full flex items-center gap-1.5 border",
                  pathname.startsWith("/municipal")
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Municipal Portal</span>
              </Link>
            )}

            {/* Commissioner Executive Portal */}
            {commUser ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-full px-3.5 py-1.5 text-xs font-bold text-amber-900">
                <Globe className="h-3.5 w-3.5 text-amber-600" />
                <Link href="/commissioner/dashboard" className="hover:underline">
                  Commissioner: {commUser.name.split(" ")[0]}
                </Link>
                <button
                  onClick={handleCommissionerLogout}
                  className="ml-1 text-slate-400 hover:text-red-600 p-0.5 rounded"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/commissioner/login"
                className={cn(
                  "px-3.5 py-2 text-xs font-bold transition-all rounded-full flex items-center gap-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm border border-amber-400",
                  pathname.startsWith("/commissioner") ? "ring-2 ring-amber-400" : ""
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Commissioner Executive</span>
              </Link>
            )}

            {/* GOVT TENDERS BUTTON (Standardized Dark Badge Button) */}
            <Link
              href="/contracts"
              title="BMC Government Contracts & On-Site Bidding Portal"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-800 shadow-sm transition-all hover:shadow group cursor-pointer"
            >
              <Gavel className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-[-12deg] transition-transform" />
              <span>Govt Tenders</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wide">
                {openTendersCount} Open
              </span>
            </Link>

            <div className="ml-2 border-l border-slate-200 pl-3">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-600 p-2 rounded-xl hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2">
          <Link
            href="/citizen"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Citizen Portal
          </Link>
          <Link
            href="/municipal/login"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Municipal Officer Portal
          </Link>
          <Link
            href="/commissioner/login"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 rounded-lg"
          >
            Commissioner Executive Portal
          </Link>
        </div>
      )}
    </header>
  );
}
