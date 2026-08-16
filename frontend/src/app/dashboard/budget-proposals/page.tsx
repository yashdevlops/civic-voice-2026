"use client";

import React, { useState } from "react";
import { Vote, ChevronDown, Calendar, CheckCircle2, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBudgetProposals } from "@/lib/useBudgetProposals";
import { useToast } from "@/lib/toast";

import { notifyVoteCast } from "@/lib/notificationStore";

export default function BudgetProposals() {
  const [activeTab, setActiveTab] = useState<"Active" | "Past">("Active");
  const { toast } = useToast();

  const {
    projects, loading, error, dataSource,
    isVotingId, isAuthenticated, hasVotedFor, voteOnProposal,
  } = useBudgetProposals();

  async function handleVoteClick(projectId: string) {
    if (!isAuthenticated) {
      toast("Please sign in to vote on budget proposals.", "error");
      return;
    }
    if (hasVotedFor(projectId)) return;
    try {
      const proj = projects.find((p) => p.id === projectId);
      await voteOnProposal(projectId);
      notifyVoteCast({ id: projectId, title: proj?.title || "Budget Proposal" });
      toast("Vote registered! Your support has been counted.", "success");
    } catch {
      toast("Vote submitted locally — will confirm once server responds.", "error");
    }
  }

  // Map ProjectOut status → tab
  const activeProjects = projects.filter((p) => p.status !== "FUNDED" && p.status !== "COMPLETED");
  const pastProjects = projects.filter((p) => p.status === "FUNDED" || p.status === "COMPLETED");
  const displayed = activeTab === "Active" ? activeProjects : pastProjects;

  return (
    <div className="space-y-6">
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">Budget Proposals</h1>
          <p className="text-xs text-slate-500">Participate in distributing city development funds</p>
        </div>

        {/* Fiscal Year Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />Fiscal Year:
          </span>
          <button className="text-xs text-slate-600 bg-white border border-slate-200 rounded-control px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm">
            2025 – 2026
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Mock/offline banner */}
      {dataSource === "mock" && (
        <div className="flex items-center gap-2 rounded-control border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 font-semibold">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          Showing sample data — live proposals unavailable
        </div>
      )}

      {error && dataSource !== "mock" && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-control p-3 text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(["Active", "Past"] as const).map((tab) => (
          <button key={tab}
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors",
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
            onClick={() => setActiveTab(tab)}>
            {tab} Proposals
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading proposals…
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold">
            No {activeTab.toLowerCase()} proposals right now.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 ps-6">Proposal</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Votes</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 pe-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {displayed.map((bp) => {
                  const hasVoted = hasVotedFor(bp.id);
                  const isVoting = isVotingId === bp.id;
                  const isFunded = bp.status === "FUNDED" || (bp.current_votes ?? 0) >= (bp.target_votes ?? 1);
                  const progressPct = Math.min(100, Math.round(((bp.current_votes ?? 0) / (bp.target_votes || 1)) * 100));

                  return (
                    <tr key={bp.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Proposal Title */}
                      <td className="p-4 ps-6 font-bold text-slate-800 max-w-xs">
                        {bp.title}
                        {isFunded && (
                          <span className="ms-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                            Fully Funded
                          </span>
                        )}
                      </td>

                      {/* Budget */}
                      <td className="p-4 text-slate-600 font-semibold whitespace-nowrap">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(bp.budget_allocated ?? 0)}
                      </td>

                      {/* Votes */}
                      <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                        {(bp.current_votes ?? 0).toLocaleString()} / {(bp.target_votes ?? 0).toLocaleString()}
                      </td>

                      {/* Progress Bar */}
                      <td className="p-4 min-w-[150px]">
                        <div className="flex items-center gap-3">
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex-1 max-w-[120px]">
                            <div
                              className={cn("h-full rounded-full transition-all duration-300", isFunded ? "bg-green-600" : "bg-primary")}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{progressPct}%</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-4 pe-6 text-right">
                        {isFunded ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-control">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Funded
                          </span>
                        ) : activeTab === "Active" ? (
                          <button
                            onClick={() => handleVoteClick(bp.id)}
                            disabled={hasVoted || !!isVotingId}
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all border rounded-control",
                              hasVoted
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "btn-outline border border-primary"
                            )}
                          >
                            {isVoting
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : hasVoted
                                ? <CheckCircle2 className="h-3.5 w-3.5" />
                                : <Vote className="h-3.5 w-3.5" />}
                            <span>{hasVoted ? "Voted!" : "Vote"}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="text-center pt-4">
        <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-primary flex items-center justify-center gap-1">
          View All Proposals on Budget Page
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
