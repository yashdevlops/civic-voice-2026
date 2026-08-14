"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/citizen", labelKey: "navCitizen" as const },
  { href: "/admin",   labelKey: "navAdmin" as const },
  { href: "/budget",  labelKey: "navBudget" as const },
];

export default function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't render the global Navbar inside dashboard routes
  if (pathname.startsWith("/dashboard") || pathname === "/" || pathname.startsWith("/login") || pathname === "/signup") {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" variant="dark" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors rounded-control",
                    isActive
                      ? "bg-primary-tint text-primary font-semibold"
                      : "text-slate-600 hover:text-primary hover:bg-primary-tint/60"
                  )}
                >
                  {t[link.labelKey]}
                </Link>
              );
            })}
            <div className="ml-3 border-l border-slate-200 pl-3">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-500 hover:text-primary p-1.5 rounded-control hover:bg-primary-tint transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-control text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-tint text-primary font-semibold"
                      : "text-slate-600 hover:text-primary hover:bg-primary-tint/60"
                  )}
                >
                  {t[link.labelKey]}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
