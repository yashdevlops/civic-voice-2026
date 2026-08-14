"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light" | "white";
  href?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 30, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
};

export default function Logo({
  size = "md",
  variant = "dark",
  href,
  className = "",
}: LogoProps) {
  const { user } = useAuth();
  const resolvedHref = href !== undefined ? href : (user ? "/dashboard" : "/");
  const { icon, text } = SIZE_MAP[size];

  const textColor =
    variant === "white"
      ? "text-white"
      : variant === "light"
      ? "text-white"
      : "text-slate-900";

  const accentColor =
    variant === "white" ? "text-green-300" : "text-primary";

  const content = (
    <span className={`flex items-center gap-2 group ${className}`}>
      {/* SVG Leaf Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Green circle background */}
        <circle cx="16" cy="16" r="16" fill="#2E7D32" />
        {/* Leaf shape */}
        <path
          d="M16 7C16 7 8 11 8 18C8 22.4183 11.5817 26 16 26C20.4183 26 24 22.4183 24 18C24 11 16 7 16 7Z"
          fill="white"
          fillOpacity="0.9"
        />
        {/* Stem */}
        <path
          d="M16 26L16 20"
          stroke="#2E7D32"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Midrib */}
        <path
          d="M16 24C16 24 12 21 10 18"
          stroke="#2E7D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {/* Wordmark */}
      <span className={`font-bold tracking-tight ${text} ${textColor} font-display`}>
        Civic
        <span className={accentColor}>Voice</span>
      </span>
    </span>
  );

  if (resolvedHref) {
    return (
      <Link href={resolvedHref} className="no-underline hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
