"use client";

import { useState, useEffect, useCallback } from 'react';
import { AutoTenderCandidate } from './types/advancedFeatures';
import { INITIAL_AUTO_TENDER_CANDIDATES } from './seedAdvancedData';
import { getTenders, seedTendersIfEmpty, TENDERS_STORE_KEY } from './contractsStore';
import { MunicipalTender } from './contracts';
import { addNotification } from './notificationStore';

export const AUTO_TENDER_KEY = "civic_voice_auto_tender_candidates_v1";
export const AUTO_TENDER_SYNC_EVENT = "civic_voice_auto_tender_sync_v1";

export function getAutoTenderCandidates(): AutoTenderCandidate[] {
  if (typeof window === "undefined") return INITIAL_AUTO_TENDER_CANDIDATES;
  try {
    const raw = localStorage.getItem(AUTO_TENDER_KEY);
    if (!raw) {
      localStorage.setItem(AUTO_TENDER_KEY, JSON.stringify(INITIAL_AUTO_TENDER_CANDIDATES));
      return INITIAL_AUTO_TENDER_CANDIDATES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUTO_TENDER_CANDIDATES;
  }
}

export function approveAutoTender(candidateId: string): MunicipalTender | null {
  const candidates = getAutoTenderCandidates();
  const cIdx = candidates.findIndex(c => c.id === candidateId);
  if (cIdx === -1) return null;

  const candidate = candidates[cIdx];
  candidate.status = 'PUBLISHED_AS_TENDER';
  localStorage.setItem(AUTO_TENDER_KEY, JSON.stringify(candidates));

  // Synthesize new tender and push to contractsStore
  seedTendersIfEmpty();
  const tenders = getTenders();
  const refSeq = Math.floor(100 + Math.random() * 900);
  const newTender: MunicipalTender = {
    id: `BMC/TND/2026/AUTO-${refSeq}`,
    title: candidate.draftTenderTitle,
    departmentCode: candidate.departmentCode,
    departmentName: candidate.departmentCode === 'roads_potholes' ? 'Roads & Civil Infrastructure' : 'Municipal Directorate',
    referenceNumber: `BMC-CE-AUTO-2026-W15-${refSeq}`,
    scopeOfWork: `Full Capital Reconstruction & Drain Integration. Rollup of ${candidate.recurringTicketIds.length} recurring micro-patch failure tickets along ${candidate.streetName}.`,
    estimatedCost: candidate.suggestedTenderBudget,
    earnestMoneyDeposit: Math.round(candidate.suggestedTenderBudget * 0.02),
    tenderFee: 10000,
    contractDurationDays: 120,
    eligibleContractorClass: ['CLASS_SPECIAL', 'CLASS_A'],
    publishedDate: new Date().toISOString(),
    bidSubmissionDeadline: new Date(Date.now() + 10 * 3600 * 24 * 1000).toISOString(),
    onsiteBiddingDateTime: new Date(Date.now() + 12 * 3600 * 24 * 1000).toISOString(),
    biddingChamber: 'Executive Tender Chamber 1, 2nd Floor, BMC Head Office, Sahid Nagar, Bhubaneswar',
    reportingGuidelines: 'Physical presence mandatory. Bring original contractor license, GST certificate, and EMD DD for verification 30 minutes prior to session.',
    totalBidsReceived: 0,
    status: 'OPEN_FOR_BIDDING',
  };

  const updatedTenders = [newTender, ...tenders];
  localStorage.setItem(TENDERS_STORE_KEY, JSON.stringify(updatedTenders));

  try {
    addNotification({
      type: 'assembly',
      title: `⚡ Capital Tender Published by Commissioner`,
      message: `Tender "#${newTender.referenceNumber}" (${newTender.title.slice(0, 35)}...) published with budget ₹${(newTender.estimatedCost / 100000).toFixed(2)} Lakhs.`,
      iconType: 'leaf',
    });
  } catch {
    // safe fallback
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTO_TENDER_SYNC_EVENT));
  }

  return newTender;
}

export function useAutoTenders() {
  const [candidates, setCandidates] = useState<AutoTenderCandidate[]>(INITIAL_AUTO_TENDER_CANDIDATES);

  const refresh = useCallback(() => {
    setCandidates(getAutoTenderCandidates());
  }, []);

  useEffect(() => {
    refresh();
    const handleSync = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener(AUTO_TENDER_SYNC_EVENT, handleSync);
      window.addEventListener("storage", handleSync);
      return () => {
        window.removeEventListener(AUTO_TENDER_SYNC_EVENT, handleSync);
        window.removeEventListener("storage", handleSync);
      };
    }
  }, [refresh]);

  return { candidates, approveAutoTender, refresh };
}
