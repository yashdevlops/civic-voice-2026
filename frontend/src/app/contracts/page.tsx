"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2, Search, Filter, Clock, Download, CheckCircle2,
  Calendar, FileText, ArrowRight, ShieldCheck, DollarSign, Briefcase,
  MapPin, AlertCircle, ChevronDown, ChevronUp, UserCheck, Tag
} from "lucide-react";
import { MunicipalTender, ContractorBidApplication, ContractorCategory } from "@/lib/contracts";
import { getTenders, getBids, CONTRACTS_SYNC_EVENT, seedTendersIfEmpty } from "@/lib/contractsStore";
import { MunicipalDeptCode, MUNICIPAL_DEPARTMENTS } from "@/lib/grievance";
import ContractBidModal from "@/components/contracts/ContractBidModal";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

// ── Countdown Helper ─────────────────────────────────────────────────────────

function DeadlineChip({ deadlineIso }: { deadlineIso: string }) {
  const deadlineMs = new Date(deadlineIso).getTime();
  const diffMs = deadlineMs - Date.now();

  if (diffMs <= 0) {
    return (
      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
        Bidding Closed
      </span>
    );
  }

  const daysLeft = Math.ceil(diffMs / (1000 * 3600 * 24));
  return (
    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
      <Clock className="h-3 w-3" />
      ⏱ {daysLeft} Days Left to Bid
    </span>
  );
}

// ── Tender Card Component ─────────────────────────────────────────────────────

function TenderCard({
  tender,
  onApply,
}: {
  tender: MunicipalTender;
  onApply: () => void;
}) {
  const [expandedScope, setExpandedScope] = useState(false);

  const handleDownloadNit = () => {
    alert(`Downloading Official NIT PDF Document for Tender #${tender.referenceNumber} (Simulated Download).`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 font-sans text-slate-800">
      {/* Top Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {tender.departmentName}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            Ref: {tender.referenceNumber}
          </span>
        </div>
        <DeadlineChip deadlineIso={tender.bidSubmissionDeadline} />
      </div>

      {/* Title & Scope */}
      <div className="space-y-1.5">
        <h3 className="text-base font-extrabold text-slate-900 leading-snug font-display">
          {tender.title}
        </h3>
        <div className="text-xs text-slate-600 leading-relaxed font-medium">
          <p className={cn("line-clamp-2", expandedScope && "line-clamp-none")}>
            {tender.scopeOfWork}
          </p>
          <button
            type="button"
            onClick={() => setExpandedScope(!expandedScope)}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] mt-0.5 inline-flex items-center gap-0.5"
          >
            {expandedScope ? (
              <>Show Less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Read Full Scope of Work <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip (High Density Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Value</span>
          <p className="text-sm font-extrabold text-emerald-700">
            ₹{(tender.estimatedCost / 100000).toFixed(2)} Lakhs
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">EMD Deposit (2%)</span>
          <p className="text-xs font-bold text-slate-800">
            ₹{tender.earnestMoneyDeposit.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Contract Period</span>
          <p className="text-xs font-bold text-slate-800">
            {tender.contractDurationDays} Days
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Tender Document Fee</span>
          <p className="text-xs font-bold text-slate-800">
            ₹{tender.tenderFee.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Eligible Classes & Physical Chamber Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Eligible Classes:</span>
          {tender.eligibleContractorClass.map((c) => (
            <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {c.replace("_", " ")}
            </span>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          <MapPin className="h-3 w-3 text-amber-600" />
          📍 On-Site Physical Chamber Auction
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-[11px] text-slate-500 font-semibold">
          Total Bids Received: <strong className="text-slate-900">{tender.totalBidsReceived} Quotes</strong>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadNit}
            className="flex-1 sm:flex-initial btn-secondary text-xs py-2.5 px-4 justify-center flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download NIT Doc
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 sm:flex-initial btn-primary text-xs py-2.5 px-5 justify-center bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Apply & Submit Bid Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Content ─────────────────────────────────────────────────────────

function ContractsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"tenders" | "bids">("tenders");
  const [tenders, setTenders] = useState<MunicipalTender[]>([]);
  const [bids, setBids] = useState<ContractorBidApplication[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");

  // Modal
  const [selectedTenderForBid, setSelectedTenderForBid] = useState<MunicipalTender | null>(null);

  const loadData = useCallback(() => {
    seedTendersIfEmpty();
    setTenders(getTenders());
    setBids(getBids());
  }, []);

  useEffect(() => {
    loadData();
    const h = () => loadData();
    window.addEventListener(CONTRACTS_SYNC_EVENT, h);
    return () => window.removeEventListener(CONTRACTS_SYNC_EVENT, h);
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("tab") === "my-bids") {
      setActiveTab("bids");
    }
  }, [searchParams]);

  // Filtering logic
  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.scopeOfWork.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === "ALL" ? true : t.departmentCode === selectedDept;
    const matchesClass = selectedClass === "ALL" ? true : t.eligibleContractorClass.includes(selectedClass as ContractorCategory);

    return matchesSearch && matchesDept && matchesClass;
  });

  return (
    <div className="min-h-screen pt-16 font-sans bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-4 py-8 sm:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5" />
                Bhubaneswar Municipal Corporation (BMC)
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                Government E-Procurement & Contract Bidding Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Official portal for municipal infrastructure works, electrical illumination, water pipelines, and solid waste tenders across BMC Wards.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 text-center">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5">
                <p className="text-xl font-extrabold text-emerald-400">{tenders.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Active Tenders</p>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5">
                <p className="text-xl font-extrabold text-amber-400">{bids.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted Bids</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveTab("tenders")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "tenders"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Active Municipal Tenders</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {tenders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("bids")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "bids"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>My Submitted Bids & Passes</span>
              {bids.length > 0 && (
                <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.2 rounded-full">
                  {bids.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-6">

        {/* ── TAB 1: ACTIVE TENDERS ────────────────────────────────────────── */}
        {activeTab === "tenders" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by tender ref, keyword or ward..."
                    className="civic-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Dept Filter */}
                <div>
                  <select
                    className="w-full font-semibold border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="ALL">All Municipal Departments</option>
                    {Object.values(MUNICIPAL_DEPARTMENTS).map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.icon} {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Filter */}
                <div>
                  <select
                    className="w-full font-semibold border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="ALL">All Contractor License Classes</option>
                    <option value="CLASS_SPECIAL">Class Special (Unlimited)</option>
                    <option value="CLASS_A">Class A (Up to ₹5 Cr)</option>
                    <option value="CLASS_B">Class B (Up to ₹1 Cr)</option>
                    <option value="MSME_STARTUP">MSME / Startup Category</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tenders List */}
            {filteredTenders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-2xl">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold text-slate-700">No matching tenders found.</p>
                <p className="text-xs text-slate-400">Try adjusting your department or class filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTenders.map((t) => (
                  <TenderCard
                    key={t.id}
                    tender={t}
                    onApply={() => setSelectedTenderForBid(t)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: MY SUBMITTED BIDS ────────────────────────────────────── */}
        {activeTab === "bids" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 font-display">
                    Submitted Contractor Bids & Security Gate Passes
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    View official quotes submitted for physical on-site auction sessions.
                  </p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  {bids.length} Active Bids
                </span>
              </div>

              {bids.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <FileText className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-sm font-bold text-slate-700">No contractor bids submitted yet.</p>
                  <button
                    onClick={() => setActiveTab("tenders")}
                    className="btn-primary text-xs mx-auto"
                  >
                    Browse Active Tenders
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((b) => (
                    <div key={b.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">{b.id}</span>
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                            {b.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Submitted: {new Date(b.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-900 text-sm">{b.tenderTitle}</p>
                        <p className="text-slate-600 font-medium">
                          Company: <strong>{b.companyName}</strong> ({b.contractorName}) • GST: {b.companyGst}
                        </p>
                      </div>

                      {/* On-Site Session Pill */}
                      <div className="rounded-xl bg-slate-900 text-white p-3 space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-amber-400 font-bold">
                          <span>📍 ON-SITE PHYSICAL SESSION</span>
                          <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded font-extrabold text-[10px]">
                            {b.onsiteBiddingDetails.gateEntryToken}
                          </span>
                        </div>
                        <p className="text-slate-200">
                          📅 {b.onsiteBiddingDetails.scheduledDate} at {b.onsiteBiddingDetails.scheduledTime}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          🏛️ {b.onsiteBiddingDetails.biddingVenue}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          Quotation: ₹{b.proposedBidAmount.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => {
                            const tenderObj = getTenders().find((t) => t.id === b.tenderId);
                            if (tenderObj) setSelectedTenderForBid(tenderObj);
                          }}
                          className="btn-secondary text-[11px] py-1.5 px-3"
                        >
                          View Security Gate Pass
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bid Modal */}
      {selectedTenderForBid && (
        <ContractBidModal
          tender={selectedTenderForBid}
          isOpen={!!selectedTenderForBid}
          onClose={() => setSelectedTenderForBid(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Contracts Portal…</div>}>
      <ContractsContent />
    </Suspense>
  );
}
