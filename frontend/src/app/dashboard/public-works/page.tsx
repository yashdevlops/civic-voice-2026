"use client";

import React, { useState } from "react";
import { Wrench, MapPin, Plus, ArrowUpRight, HelpCircle } from "lucide-react";
import { MOCK_PUBLIC_WORKS } from "@/lib/mock-data";
import ProgressRing from "@/components/ProgressRing";
import { cn } from "@/lib/utils";

export default function PublicWorks() {
  const [activeTab, setActiveTab] = useState<"All" | "In Progress" | "Completed">("All");

  const filteredWorks = MOCK_PUBLIC_WORKS.filter((pw) => {
    if (activeTab === "All") return true;
    if (activeTab === "In Progress") return pw.status === "In Progress" || pw.status === "Planned";
    if (activeTab === "Completed") return pw.status === "Completed";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-display">
            Public Works & Infrastructure
          </h1>
          <p className="text-xs text-slate-500">Track structural improvements and suggest new projects</p>
        </div>

        <button className="btn-primary flex items-center justify-center gap-1.5 self-start sm:self-auto">
          <Plus className="h-4.5 w-4.5" />
          <span>+ Propose Work</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-slate-200">
        {(["All", "In Progress", "Completed"] as const).map((tab) => (
          <button
            key={tab}
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "All" ? "All Works" : tab}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorks.map((pw, idx) => (
          <div
            key={pw.id}
            className="bg-white border border-slate-100 rounded-card shadow-sm hover:shadow-card-lg transition-all duration-150 flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Image thumbnail placeholder */}
              <div
                className="h-40 w-full bg-slate-100 relative bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://i.pinimg.com/736x/a0/d4/0b/a0d40b1c6079c022003362f79c929ebe.jpg')`
                }}
              >
                {/* Priority Label */}
                {pw.isTopPriority && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-pill shadow">
                    Top Priority
                  </span>
                )}

                {/* Status tag floating */}
                <span
                  className={cn(
                    "absolute bottom-3 right-3 text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-pill border backdrop-blur-md",
                    pw.status === "In Progress"
                      ? "bg-blue-50/90 text-blue-800 border-blue-200"
                      : pw.status === "Planned"
                        ? "bg-amber-50/90 text-amber-800 border-amber-200"
                        : "bg-purple-50/90 text-purple-800 border-purple-200"
                  )}
                >
                  {pw.status}
                </span>
              </div>

              {/* Title & Location details */}
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug min-h-[40px]">
                  {pw.title}
                </h3>

                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{pw.location}</span>
                </div>
              </div>
            </div>

            {/* Bottom details with ProgressRing */}
            <div className="px-5 pb-5 pt-3 border-t border-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  VOTES & COST
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {pw.votes} votes · Est. Cost: {pw.estimatedCost}
                </p>
              </div>

              {/* ProgressRing component usage */}
              <ProgressRing
                value={pw.completionPct}
                size={48}
                strokeWidth={4.5}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="text-center pt-4">
        <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-primary flex items-center justify-center gap-1">
          View All Public Works
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
