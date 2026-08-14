"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useI18n, LANGUAGE_LABELS, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary px-2 py-1.5 rounded-control hover:bg-primary-tint transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{LANGUAGE_LABELS[lang]}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-36 rounded-card bg-white border border-slate-100 shadow-card-lg z-50 animate-fade-in overflow-hidden"
          role="listbox"
        >
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={lang === l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm transition-colors",
                lang === l
                  ? "text-primary bg-primary-tint font-medium"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              )}
            >
              {LANGUAGE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
