import { MunicipalTender, ContractorBidApplication, ContractorCategory } from './contracts';
import { SEED_MUNICIPAL_TENDERS } from './seedContracts';
import { addNotification } from './notificationStore';
import { addMessage } from './messagesStore';

export const TENDERS_STORE_KEY = "civic_voice_tenders_master_v1";
export const BIDS_STORE_KEY = "civic_voice_contract_bids_v1";
export const CONTRACTS_SYNC_EVENT = "civic_voice_contracts_sync_v1";

export function seedTendersIfEmpty(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(TENDERS_STORE_KEY);
  if (!existing) {
    localStorage.setItem(TENDERS_STORE_KEY, JSON.stringify(SEED_MUNICIPAL_TENDERS));
  }
}

export function getTenders(): MunicipalTender[] {
  if (typeof window === "undefined") return SEED_MUNICIPAL_TENDERS;
  seedTendersIfEmpty();
  try {
    const raw = localStorage.getItem(TENDERS_STORE_KEY);
    if (!raw) return SEED_MUNICIPAL_TENDERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_MUNICIPAL_TENDERS;
  } catch {
    return SEED_MUNICIPAL_TENDERS;
  }
}

export function getTenderById(id: string): MunicipalTender | null {
  const tenders = getTenders();
  return tenders.find((t) => t.id === id || t.referenceNumber === id) || null;
}

export function getBids(): ContractorBidApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BIDS_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getBidsByTender(tenderId: string): ContractorBidApplication[] {
  const bids = getBids();
  return bids.filter((b) => b.tenderId === tenderId);
}

export function getBidsByBidder(bidderEmail: string): ContractorBidApplication[] {
  const bids = getBids();
  const norm = bidderEmail.trim().toLowerCase();
  return bids.filter((b) => b.bidderEmail.toLowerCase() === norm);
}

export function submitContractorBid(data: {
  tenderId: string;
  contractorName: string;
  companyName: string;
  companyGst: string;
  contractorLicenseClass: ContractorCategory;
  bidderEmail: string;
  bidderPhone: string;
  proposedBidAmount: number;
  completionTimelineDays: number;
}): ContractorBidApplication {
  seedTendersIfEmpty();
  const tender = getTenderById(data.tenderId);
  const tenderTitle = tender ? tender.title : "Municipal Works Contract";

  const bidSeq = Math.floor(1000 + Math.random() * 9000);
  const bidId = `BID-2026-${bidSeq}`;
  const passTokenNum = Math.floor(1000 + Math.random() * 9000);
  const gateEntryToken = `#BMC-PASS-${passTokenNum}`;

  // Synthesize onsite bidding schedule
  let scheduledDate = "30 August 2026";
  let scheduledTime = "11:30 AM IST";

  if (tender && tender.onsiteBiddingDateTime) {
    try {
      const dt = new Date(tender.onsiteBiddingDateTime);
      scheduledDate = dt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      scheduledTime = dt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST";
    } catch {
      // fallback
    }
  }

  const biddingVenue = tender?.biddingChamber || "Executive Tender Chamber 1, 2nd Floor, BMC Head Office, Bhubaneswar";
  const reportingInstruction = tender?.reportingGuidelines || "Physical presence mandatory 30 minutes prior to session with original license & EMD DD.";

  const newBid: ContractorBidApplication = {
    id: bidId,
    tenderId: data.tenderId,
    tenderTitle,
    contractorName: data.contractorName,
    companyName: data.companyName,
    companyGst: data.companyGst,
    contractorLicenseClass: data.contractorLicenseClass,
    bidderEmail: data.bidderEmail,
    bidderPhone: data.bidderPhone,
    proposedBidAmount: data.proposedBidAmount,
    completionTimelineDays: data.completionTimelineDays,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    onsiteBiddingDetails: {
      scheduledDate,
      scheduledTime,
      biddingVenue,
      gateEntryToken,
      reportingInstruction,
    },
  };

  // 1. Save Bid to localStorage
  const existingBids = getBids();
  const updatedBids = [newBid, ...existingBids];
  localStorage.setItem(BIDS_STORE_KEY, JSON.stringify(updatedBids));

  // 2. Increment totalBidsReceived on target tender
  const tenders = getTenders();
  const tIdx = tenders.findIndex((t) => t.id === data.tenderId);
  if (tIdx !== -1) {
    tenders[tIdx].totalBidsReceived = (tenders[tIdx].totalBidsReceived || 0) + 1;
    localStorage.setItem(TENDERS_STORE_KEY, JSON.stringify(tenders));
  }

  // 3. Dispatch automated notification
  try {
    addNotification({
      type: "complaint_status",
      title: `🏛️ On-Site Bidding Scheduled — ${bidId}`,
      message: `Your bid for "${tenderTitle.slice(0, 40)}..." is confirmed. On-site auction takes place on ${scheduledDate} at ${scheduledTime} in ${biddingVenue.split(',')[0]}.`,
      relatedId: bidId,
      iconType: "info",
    });
  } catch {
    // safe fallback
  }

  // 4. Dispatch official inbox message
  try {
    addMessage({
      sender: "BMC e-Procurement Cell",
      subject: `On-Site Bidding Schedule & Entry Pass — Tender ${tender?.referenceNumber || data.tenderId}`,
      body: `Dear Bidder, your proposal for Tender #${tender?.referenceNumber || data.tenderId} has been registered successfully. Please ensure your authorized representative reports physically with Security Pass ${gateEntryToken} and original credentials at ${biddingVenue} before ${scheduledTime} on ${scheduledDate}.`,
      category: "CONTRACT",
      actionUrl: "/contracts",
    });
  } catch {
    // safe fallback
  }

  // Dispatch sync event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONTRACTS_SYNC_EVENT));
  }

  return newBid;
}

import { useState, useEffect, useCallback } from "react";

export function useContractsStore() {
  const [tenders, setTenders] = useState<MunicipalTender[]>([]);
  const [bids, setBids] = useState<ContractorBidApplication[]>([]);

  const refresh = useCallback(() => {
    seedTendersIfEmpty();
    setTenders(getTenders());
    setBids(getBids());
  }, []);

  useEffect(() => {
    refresh();
    const handleSync = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener(CONTRACTS_SYNC_EVENT, handleSync);
      window.addEventListener("storage", handleSync);
      return () => {
        window.removeEventListener(CONTRACTS_SYNC_EVENT, handleSync);
        window.removeEventListener("storage", handleSync);
      };
    }
  }, [refresh]);

  return { tenders, bids, refresh };
}
