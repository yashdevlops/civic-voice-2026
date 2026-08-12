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
        // ── Civic design palette ────────────────────────────────────────────
        // Deep municipal ink — primary text and nav chrome
        ink: {
          DEFAULT: "#16232B",
          light: "#1e3040",
        },
        // Calm slate-teal — UI chrome, cards, headers
        civic: {
          DEFAULT: "#1B3A4B",
          light: "#244d62",
          lighter: "#2d6080",
        },
        // Civic amber — single accent: CTAs, alerts, progress
        amber: {
          civic: "#D9A441",
          light: "#E8B85A",
          dark: "#B8872E",
        },
        // Status green — resolved states
        resolved: {
          DEFAULT: "#3C7A5B",
          light: "#4a9470",
          bg: "#EBF5F0",
        },
        // Paper grey — page backgrounds (not cream)
        paper: {
          DEFAULT: "#EEF2F0",
          dark: "#DDE4E0",
        },
        // Status colours — defined once here, referenced via CSS vars in globals.css
        status: {
          open: "#E05A2B",
          "in-progress": "#D9A441",
          resolved: "#3C7A5B",
          rejected: "#6B7280",
        },
        // Category badge colours
        category: {
          sanitation: "#10B981",
          roads: "#F59E0B",
          electricity: "#8B5CF6",
          water: "#3B82F6",
          other: "#6B7280",
        },
      },
      fontFamily: {
        // Grotesk for body/UI
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Slab serif for headers/ticket titles — evokes official documents
        slab: ["'Roboto Slab'", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        ticket: "2px", // Paper-ticket feel — sharp corners on grievance cards
      },
      boxShadow: {
        ticket: "2px 2px 0 0 rgba(22,35,43,0.15), 4px 4px 0 0 rgba(22,35,43,0.07)",
        "ticket-hover": "3px 3px 0 0 rgba(22,35,43,0.2), 6px 6px 0 0 rgba(22,35,43,0.1)",
        card: "0 2px 12px rgba(22,35,43,0.08)",
      },
      animation: {
        "slide-in-top": "slideInTop 0.3s ease-out",
        "progress-fill": "progressFill 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.25s ease-out",
        "modal-enter": "modalEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        slideInTop: {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
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
      },
    },
  },
  plugins: [],
};

export default config;
