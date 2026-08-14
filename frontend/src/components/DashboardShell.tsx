"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wrench,
  IndianRupee,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

// ── Navigation items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard/complaints",      label: "My Complaints",    icon: FileText },
  { href: "/dashboard/analytics",       label: "Analytics",        icon: BarChart3 },
  { href: "/dashboard/public-works",    label: "Public Works",     icon: Wrench },
  { href: "/dashboard/budget-proposals",label: "Budget Proposals", icon: IndianRupee },
  { href: "/dashboard/messages",        label: "Messages",         icon: MessageSquare, badge: 2 },
  { href: "/dashboard/notifications",   label: "Notifications",    icon: Bell, badge: 5 },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/profile",  label: "Profile",  icon: User },
  { href: "/dashboard/profile",  label: "Settings", icon: Settings },
];

// ── Sidebar Nav Item ─────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "sidebar-nav-item",
        isActive && "active"
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { logout, user } = useAuth();
  
  return (
    <aside className="flex h-full w-full flex-col bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-slate-100">
        <Logo size="md" variant="dark" />
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-control text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href + item.label} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Bottom: profile/settings + divider + logout */}
      <div className="px-3 pb-4 space-y-0.5">
        <div className="h-px bg-slate-100 mb-2" />
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href + item.label} {...item} onClick={onClose} />
        ))}
        <button
          className="sidebar-nav-item destructive w-full"
          onClick={logout}
        >
          <LogOut style={{ width: 18, height: 18 }} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* Old routes — accessible from sidebar */}
      <div className="px-3 pb-3">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1">
          Operations
        </p>
        <Link
          href="/admin"
          className="sidebar-nav-item text-slate-500"
          onClick={onClose}
        >
          <BarChart3 style={{ width: 18, height: 18 }} />
          <span>Admin Dashboard</span>
        </Link>
        <Link
          href="/citizen"
          className="sidebar-nav-item text-slate-500"
          onClick={onClose}
        >
          <FileText style={{ width: 18, height: 18 }} />
          <span>Report an Issue</span>
        </Link>
      </div>
    </aside>
  );
}

// ── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="fixed top-0 right-0 left-0 md:left-60 z-30 flex h-16 items-center justify-between gap-4 bg-white border-b border-slate-100 px-4 sm:px-6">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden p-1.5 rounded-control text-slate-500 hover:bg-slate-100"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="hidden sm:flex flex-1 max-w-sm items-center gap-2 rounded-control border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
        <Search className="h-4 w-4 shrink-0" />
        <span>Search…</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Location selector */}
        <button className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-control px-3 py-1.5 hover:bg-slate-100 transition-colors">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {user?.location?.split(",")[0] || "Bengaluru"}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Period selector */}
        <button className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-control px-3 py-1.5 hover:bg-slate-100 transition-colors">
          This Month
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Notification bell */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-control text-slate-500 hover:text-primary hover:bg-primary-tint transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </Link>

        {/* Avatar */}
        <Link
          href="/dashboard/profile"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
          title={user?.name || "Profile"}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}

// ── DashboardShell ───────────────────────────────────────────────────────────

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Role Gate & Redirect logic
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  // Loading or unauthenticated fallback state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-semibold">Loading session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop fixed sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col z-40 shadow-sidebar">
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 h-full shadow-card-lg animate-slide-in-left">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 mt-16 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
