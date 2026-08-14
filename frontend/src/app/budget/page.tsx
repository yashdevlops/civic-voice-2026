"use client";
export const dynamic = 'force-dynamic';

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Vote, TrendingUp, IndianRupee, CheckCircle2, Loader2, AlertCircle, ArrowLeft, LogIn } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLiveUpdates } from "@/lib/ws";
import type { LiveEvent } from "@/lib/ws";
import { cn, formatRupees, categoryClass } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useBudgetProposals } from "@/lib/useBudgetProposals";
import type { ProjectOut } from "@/lib/api";

export default function BudgetPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const {
    projects, stats, loading, error, dataSource,
    isVotingId, isAuthenticated, hasVotedFor, voteOnProposal,
  } = useBudgetProposals();

  const STATUS_LABELS: Record<string, string> = {
    VOTING: t.projectVoting || "Voting",
    FUNDED: t.projectFunded || "Funded",
    PROPOSED: "Proposed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Header */}
      <div className="px-4 py-8 sm:px-6" style={{ background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)" }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <Link
              href={user ? "/dashboard" : "/"}
              className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white font-semibold transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-control"
            >
              <ArrowLeft style={{ width: 13, height: 13 }} />
              {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-white/20">
              <Vote className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.budgetTitle || "Participatory Budgeting"}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t.budgetSubtitle || "Vote on community proposals"}</p>
            </div>
          </div>

          {stats && (
            <div className="mt-5 flex flex-wrap gap-4">
              {(stats.by_category ?? []).map((row) => (
                <div key={row?.category ?? Math.random().toString()}
                  className="flex items-center gap-2 bg-white/15 rounded-control px-3 py-1.5 border border-white/10">
                  <span className={cn("h-2 w-2 rounded-full", {
                    "bg-green-400": row?.category === "SANITATION",
                    "bg-yellow-400": row?.category === "ROADS",
                    "bg-purple-400": row?.category === "ELECTRICITY",
                    "bg-blue-400": row?.category === "WATER",
                    "bg-gray-400": row?.category === "OTHER",
                  })} />
                  <span className="text-xs text-white/80">{row?.category ?? "Other"}</span>
                  <span className="text-xs font-semibold text-white">{row?.count ?? 0} reports</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Mock data banner */}
        {dataSource === "mock" && (
          <div className="bg-amber-50 border border-amber-200 rounded-control p-4 flex items-center gap-3 text-xs text-amber-800 font-semibold mb-6">
            <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
            <span>Showing sample data — live proposals unavailable</span>
          </div>
        )}

        {error && dataSource !== "mock" && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-control p-3 text-sm mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* Sign-in prompt if not authenticated */}
        {!isAuthenticated && !loading && (
          <div className="mb-6 rounded-card border border-primary/30 bg-primary-tint p-4 flex items-center gap-3 text-sm text-primary">
            <LogIn className="h-4 w-4 shrink-0" />
            <span>
              <Link href="/login" className="font-bold underline underline-offset-2">Sign in</Link>{" "}
              to vote on proposals. Your vote helps prioritise community projects.
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />{t.loading || "Loading…"}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card border border-slate-100 flex flex-col items-center justify-center gap-3">
            <Vote className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No active proposals right now — check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const currentVotes = project?.current_votes ?? 0;
              const targetVotes = project?.target_votes ?? 1;
              const progressPct = Math.min(100, Math.round((currentVotes / targetVotes) * 100));
              const isFunded = project?.status === "FUNDED" || currentVotes >= targetVotes;
              const hasVoted = hasVotedFor(project?.id ?? "");
              const isVoting = isVotingId === project?.id;

              return (
                <ProjectCard
                  key={project?.id ?? Math.random().toString()}
                  project={project}
                  progressPct={progressPct}
                  isFunded={isFunded}
                  hasVoted={hasVoted}
                  isVoting={isVoting}
                  isAuthenticated={isAuthenticated}
                  statusLabel={isFunded ? (t.projectFunded || "Funded") : STATUS_LABELS[project?.status ?? "VOTING"] || project?.status || "Voting"}
                  onVote={() => voteOnProposal(project?.id ?? "")}
                  t={t}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project card sub-component (hook must be at component scope, not in map) ──

function ProjectCard({
  project, progressPct, isFunded, hasVoted, isVoting, isAuthenticated,
  statusLabel, onVote, t,
}: {
  project: ProjectOut;
  progressPct: number;
  isFunded: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  isAuthenticated: boolean;
  statusLabel: string;
  onVote: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <div
      className={cn(
        "bg-white shadow-card border-t-4 flex flex-col transition-all duration-150 hover:shadow-card-lg",
        isFunded ? "border-green-600" : "border-primary"
      )}
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {/* Card header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={cn("text-xs px-2.5 py-0.5 rounded-pill font-medium", categoryClass(project?.category ?? "OTHER"))}>
            {project?.category ?? "OTHER"}
          </span>
          <span className={cn(
            "text-xs px-2.5 py-0.5 rounded-pill font-semibold border",
            isFunded
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-primary/5 text-primary border-primary/20"
          )}>
            {statusLabel}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-800 leading-snug">{project?.title ?? "Untitled Proposal"}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{project?.description ?? ""}</p>
      </div>

      {/* Budget */}
      <div className="px-5 mt-4 flex items-center gap-1.5 text-sm text-slate-500">
        <IndianRupee className="h-4 w-4 text-primary" />
        <span className="font-bold text-slate-800">{formatRupees(project?.budget_allocated ?? 0)}</span>
        <span className="text-xs">allocated</span>
      </div>

      {/* Progress bar */}
      <div className="px-5 mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            {project?.current_votes ?? 0} / {project?.target_votes ?? 0} {t.projectVotes || "votes"}
          </span>
          <span className="font-bold text-slate-700">{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", isFunded ? "bg-green-600" : "bg-primary")}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Vote button */}
      <div className="p-5 mt-auto pt-4">
        {isFunded ? (
          <div className="flex items-center justify-center gap-2 rounded-control py-2.5 bg-green-50 text-green-700 text-sm font-medium border border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            Fully Funded
          </div>
        ) : !isAuthenticated ? (
          <Link
            href="/login?redirect=/budget"
            className="w-full flex items-center justify-center gap-2 rounded-control py-2.5 text-sm font-semibold border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-all"
          >
            <LogIn className="h-4 w-4" />
            Sign in to vote
          </Link>
        ) : (
          <button
            onClick={onVote}
            disabled={hasVoted || isVoting}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-control py-2.5 text-sm font-semibold transition-all",
              hasVoted
                ? "bg-slate-100 text-slate-400 cursor-default border border-slate-200"
                : "btn-primary"
            )}
          >
            {isVoting ? <Loader2 className="h-4 w-4 animate-spin" />
              : hasVoted ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                : <Vote className="h-4 w-4" />}
            {hasVoted ? "Voted!" : (t.projectVote || "Vote")}
          </button>
        )}
      </div>
    </div>
  );
}
