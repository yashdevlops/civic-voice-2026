"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Building2, User, Mail, Phone, ShieldCheck, DollarSign, Calendar, Printer, FileText, ArrowRight, Loader2 } from "lucide-react";
import { MunicipalTender, ContractorCategory, ContractorBidApplication } from "@/lib/contracts";
import { submitContractorBid } from "@/lib/contractsStore";
import { useAuth } from "@/lib/auth";

interface ContractBidModalProps {
  tender: MunicipalTender;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bid: ContractorBidApplication) => void;
}

export default function ContractBidModal({
  tender,
  isOpen,
  onClose,
  onSuccess,
}: ContractBidModalProps) {
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Credentials
  const [companyName, setCompanyName] = useState("M/s Kalinga Civil Infrastructures Pvt Ltd");
  const [contractorName, setContractorName] = useState(user?.name || "Er. K. C. Mohapatra");
  const [companyGst, setCompanyGst] = useState("21AAACK1234F1Z5");
  const [bidderEmail, setBidderEmail] = useState(user?.email || "contractor@kalingacivil.com");
  const [bidderPhone, setBidderPhone] = useState(user?.phone || "+91 94370 99888");
  const [contractorLicenseClass, setContractorLicenseClass] = useState<ContractorCategory>(
    tender.eligibleContractorClass[0] || "CLASS_A"
  );

  // Step 2: Financial Proposal
  const [proposedBidAmount, setProposedBidAmount] = useState<number>(
    Math.round(tender.estimatedCost * 0.95)
  );
  const [completionTimelineDays, setCompletionTimelineDays] = useState<number>(
    tender.contractDurationDays
  );
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Step 3: Submitted Bid Data
  const [submittedBid, setSubmittedBid] = useState<ContractorBidApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time % variance indicator
  const diff = proposedBidAmount - tender.estimatedCost;
  const pct = tender.estimatedCost > 0 ? (diff / tender.estimatedCost) * 100 : 0;
  const isLower = diff <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const bid = submitContractorBid({
      tenderId: tender.id,
      contractorName,
      companyName,
      companyGst,
      contractorLicenseClass,
      bidderEmail,
      bidderPhone,
      proposedBidAmount: Number(proposedBidAmount),
      completionTimelineDays: Number(completionTimelineDays),
    });

    setSubmittedBid(bid);
    setIsSubmitting(false);
    setStep(3);
    if (onSuccess) onSuccess(bid);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {tender.departmentName}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {tender.referenceNumber}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
              Apply & Submit Bid Quote
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className={step === 1 ? "text-emerald-400 font-extrabold" : "text-slate-400"}>
              1. Firm Credentials
            </span>
            <span className="text-slate-600">→</span>
            <span className={step === 2 ? "text-emerald-400 font-extrabold" : "text-slate-400"}>
              2. Financial Quotation
            </span>
            <span className="text-slate-600">→</span>
            <span className={step === 3 ? "text-emerald-400 font-extrabold" : "text-slate-400"}>
              3. Gate Pass Receipt
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Step {step} of 3</span>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* STEP 1: CREDENTIALS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                <p className="font-bold text-emerald-900">{tender.title}</p>
                <p className="text-[11px] text-emerald-700">
                  Estimated Value: <strong>₹{(tender.estimatedCost / 100000).toFixed(2)} Lakhs</strong> • EMD: ₹{tender.earnestMoneyDeposit.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-medium text-slate-700">
                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    className="civic-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">GSTIN Registration No. *</label>
                  <input
                    type="text"
                    required
                    className="civic-input font-mono uppercase"
                    value={companyGst}
                    onChange={(e) => setCompanyGst(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">Lead Bidder Name & Designation *</label>
                  <input
                    type="text"
                    required
                    className="civic-input"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">Contractor License Classification *</label>
                  <select
                    className="w-full font-bold border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    value={contractorLicenseClass}
                    onChange={(e) => setContractorLicenseClass(e.target.value as ContractorCategory)}
                  >
                    <option value="CLASS_SPECIAL">Class Special (Unlimited Value)</option>
                    <option value="CLASS_A">Class A (Up to ₹5.00 Crores)</option>
                    <option value="CLASS_B">Class B (Up to ₹1.00 Crore)</option>
                    <option value="CLASS_C">Class C (Up to ₹50 Lakhs)</option>
                    <option value="MSME_STARTUP">MSME / Startup Exemption Category</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">Official Mobile Number *</label>
                  <input
                    type="text"
                    required
                    className="civic-input"
                    value={bidderPhone}
                    onChange={(e) => setBidderPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    className="civic-input"
                    value={bidderEmail}
                    onChange={(e) => setBidderEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FINANCIAL PROPOSAL */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Reference Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Municipal Estimated Cost</p>
                  <p className="text-2xl font-extrabold text-emerald-400">
                    ₹{tender.estimatedCost.toLocaleString("en-IN")}
                    <span className="text-xs text-slate-300 font-normal ml-2">({(tender.estimatedCost / 100000).toFixed(2)} Lakhs)</span>
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <p className="font-bold">Required EMD: ₹{tender.earnestMoneyDeposit.toLocaleString("en-IN")}</p>
                  <p className="text-slate-400">Contract Duration: {tender.contractDurationDays} Days</p>
                </div>
              </div>

              {/* Financial Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">
                    Your Proposed Bid Amount (₹ INR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={100000}
                      step={10000}
                      className="w-full text-base font-extrabold border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={proposedBidAmount}
                      onChange={(e) => setProposedBidAmount(Number(e.target.value))}
                    />
                  </div>

                  {/* Real-time Variance Indicator */}
                  <div className="mt-2 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between">
                    <span>Bid Variance vs Estimate:</span>
                    {isLower ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        📉 {pct.toFixed(2)}% Below Municipal Estimate (Competitive Bid)
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        📈 +{pct.toFixed(2)}% Above Municipal Estimate
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-slate-500 text-[10px] font-bold mb-1">
                    Proposed Completion Timeline (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    className="civic-input"
                    value={completionTimelineDays}
                    onChange={(e) => setCompletionTimelineDays(Number(e.target.value))}
                  />
                </div>

                {/* Technical Proposal Checkbox */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span className="text-[11px] leading-relaxed font-semibold">
                      I hereby certify that M/s <strong>{companyName}</strong> meets all eligibility criteria for <strong>{contractorLicenseClass}</strong>, accepts physical presence requirements for on-site auction chambers, and agrees to EMD deposit forfeiture conditions specified by BMC.
                    </span>
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: ON-SITE ENTRY PASS RECEIPT */}
          {step === 3 && submittedBid && (
            <div className="space-y-4 font-mono text-slate-900 animate-fade-in">
              {/* High-Contrast Receipt Box */}
              <div className="bg-slate-950 text-emerald-400 p-5 rounded-2xl border-2 border-emerald-500 shadow-2xl space-y-4">
                <div className="border-b border-emerald-500/30 pb-3 text-center">
                  <span className="text-lg font-extrabold tracking-wider text-white">
                    🏛️ BHUBANESWAR MUNICIPAL CORPORATION
                  </span>
                  <p className="text-[11px] text-emerald-300 font-bold tracking-widest mt-0.5">
                    ON-SITE BIDDING CONFIRMATION RECEIPT & SECURITY GATE PASS
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-emerald-500/30 pb-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Bid Application ID</span>
                    <p className="font-extrabold text-white text-sm">{submittedBid.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Tender Ref Number</span>
                    <p className="font-extrabold text-white text-sm">{tender.referenceNumber}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[10px] uppercase">Quotation Submitted</span>
                    <p className="font-extrabold text-emerald-300 text-sm">
                      ₹{submittedBid.proposedBidAmount.toLocaleString("en-IN")} ({submittedBid.companyName})
                    </p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-2 text-xs">
                  <p className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    OFFICIAL ON-SITE PHYSICAL BIDDING SESSION DETAILS:
                  </p>
                  <ul className="space-y-1.5 text-slate-200 text-[11px] pl-2 border-l-2 border-amber-400">
                    <li>
                      <strong className="text-white">Date & Time:</strong> {submittedBid.onsiteBiddingDetails.scheduledDate} at {submittedBid.onsiteBiddingDetails.scheduledTime} (Sharp)
                    </li>
                    <li>
                      <strong className="text-white">Physical Venue:</strong> {submittedBid.onsiteBiddingDetails.biddingVenue}
                    </li>
                    <li>
                      <strong className="text-amber-400">Security Gate Pass:</strong>{" "}
                      <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-extrabold text-xs">
                        {submittedBid.onsiteBiddingDetails.gateEntryToken}
                      </span>{" "}
                      (Present at Gate/Reception)
                    </li>
                    <li>
                      <strong className="text-white">Reporting Window:</strong> 30 minutes prior to session for document & EMD verification.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 1 && (
            <>
              <button onClick={onClose} className="btn-secondary text-xs">Cancel</button>
              <button onClick={() => setStep(2)} className="btn-primary text-xs flex items-center gap-2">
                <span>Continue to Financial Quote</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="btn-secondary text-xs">Back</button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !acceptedTerms}
                className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit Official Bid Proposal</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="flex items-center justify-between w-full">
              <button onClick={handlePrint} className="btn-secondary text-xs flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                Print / Download Security Pass
              </button>
              <button onClick={onClose} className="btn-primary text-xs bg-slate-900 hover:bg-slate-800 text-white">
                Close & View Bids
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
