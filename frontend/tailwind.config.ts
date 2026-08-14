import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── CivicVoice Design Palette ───────────────────────────────────────
        // Forest Green — primary buttons, active states, links
        primary: {
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
          tint: "#E8F5E9",
        },
        // App backgrounds
        bg: {
          DEFAULT: "#F8FAFC",
          alt: "#F4F6F8",
        },
        // Surface — cards, sidebar, topbar
        surface: "#FFFFFF",
        // Text
        "text-primary": "#0F172A",
        "text-secondary": "#64748B",
        // Border
        border: "#E2E8F0",

        // ── Status colours ──────────────────────────────────────────────────
        status: {
          "inprogress-bg": "#DBEAFE",
          "inprogress-text": "#1E40AF",
          "pending-bg": "#FEF3C7",
          "pending-text": "#92400E",
          "resolved-bg": "#DCFCE7",
          "resolved-text": "#166534",
        },

        // ── Category badge colours (retained for backward compat) ───────────
        category: {
          sanitation: "#10B981",
          roads: "#F59E0B",
          electricity: "#8B5CF6",
          water: "#3B82F6",
          other: "#6B7280",
          cleanliness: "#10B981",
          "street-lights": "#F59E0B",
          "waste-mgmt": "#6B7280",
          "water-supply": "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        "card-lg": "0 4px 6px rgba(15,23,42,0.04), 0 10px 15px rgba(15,23,42,0.06)",
        "card-hover": "0 4px 12px rgba(15,23,42,0.08), 0 8px 24px rgba(15,23,42,0.06)",
        sidebar: "2px 0 8px rgba(15,23,42,0.06)",
      },
      animation: {
        "slide-in-top": "slideInTop 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.25s ease-out",
        "progress-fill": "progressFill 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.25s ease-out",
        "modal-enter": "modalEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-green": "pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        slideInTop: {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        modalEnter: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGreen: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      backgroundImage: {
        "green-gradient": "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
        "hero-gradient": "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
        "card-gradient": "linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
