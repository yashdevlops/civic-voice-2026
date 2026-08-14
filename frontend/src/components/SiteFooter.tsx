import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Instagram,
} from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { label: "Report an Issue", href: "/citizen" },
    { label: "Track Complaints", href: "/dashboard/complaints" },
    { label: "Budget Proposals", href: "/budget" },
    { label: "Public Works", href: "/dashboard/public-works" },
    { label: "Analytics", href: "/dashboard/analytics" },
  ],
  Government: [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Officer Login", href: "/login/admin" },
    { label: "Municipal Resources", href: "#resources" },
    { label: "Tender Notices", href: "#tenders" },
    { label: "RTI Portal", href: "#rti" },
  ],
  Support: [
    { label: "Help Center", href: "#help" },
    { label: "Contact Support", href: "#contact" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Accessibility", href: "#accessibility" },
  ],
};

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/yaassshhhh.d_/?hl=en" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/yashdeo-aiml", external: true },
  { icon: Github, label: "GitHub", href: "https://github.com/yashdevlops", external: true },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              AI-powered civic issue reporting and participatory budgeting — connecting citizens with their municipal government.
            </p>

            {/* Contact details */}
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin style={{ width: 13, height: 13 }} className="mt-0.5 shrink-0 text-primary" />
                <span>ITER College Road in Jagamara, near Khandagiri, Bhubaneswar, Odisha 751030</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone style={{ width: 13, height: 13 }} className="shrink-0 text-primary" />
                <a href="tel:+919798634028" className="hover:text-white transition-colors">
                  +91 97986 34028
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail style={{ width: 13, height: 13 }} className="shrink-0 text-primary" />
                <a href="mailto:yashdeo01@gmail.com" className="hover:text-white transition-colors">
                  yashdeo01@gmail.com
                </a>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL.map(({ icon: Icon, label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                  <Icon style={{ width: 14, height: 14 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2-4: Link groups */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-200 text-primary">›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="mt-10 rounded-card bg-slate-800/60 border border-slate-700/40 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>All systems operational</span>
            <span className="text-slate-600">·</span>
            <a
              href="#status"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Status page
              <ExternalLink style={{ width: 11, height: 11 }} className="ml-0.5" />
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>v2.0.0</span>
            <span>·</span>
            <span>Built for SOA Ideathon S36</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {year} CivicVoice. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <a href="#cookies" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
