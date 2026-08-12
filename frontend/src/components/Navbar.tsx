"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/citizen", labelKey: "navCitizen" as const },
  { href: "/admin", labelKey: "navAdmin" as const },
  { href: "/budget", labelKey: "navBudget" as const },
];

export default function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-civic shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/citizen" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-civic">
              <MapPin className="h-4 w-4 text-ink" />
            </div>
            <span className="font-slab text-lg font-semibold text-white tracking-wide group-hover:text-amber-civic transition-colors">
              {t.navTitle}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded text-sm font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-amber-civic text-ink"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {t[link.labelKey]}
              </Link>
            ))}
            <div className="ml-3 border-l border-white/20 pl-3">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/80 hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="md:hidden bg-ink border-t border-white/10">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-amber-civic text-ink"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {t[link.labelKey]}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-white/10">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
