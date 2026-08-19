"use client";

import { useState, useEffect, useCallback } from 'react';
import { ContractorScorecard } from './types/advancedFeatures';
import { INITIAL_CONTRACTOR_SCORECARDS } from './seedAdvancedData';

export const CONTRACTOR_SCORECARDS_KEY = "civic_voice_contractor_scorecards_v1";

export function getContractorScorecards(): ContractorScorecard[] {
  if (typeof window === "undefined") return INITIAL_CONTRACTOR_SCORECARDS;
  try {
    const raw = localStorage.getItem(CONTRACTOR_SCORECARDS_KEY);
    if (!raw) {
      localStorage.setItem(CONTRACTOR_SCORECARDS_KEY, JSON.stringify(INITIAL_CONTRACTOR_SCORECARDS));
      return INITIAL_CONTRACTOR_SCORECARDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONTRACTOR_SCORECARDS;
  }
}

export function getContractorById(id: string): ContractorScorecard | null {
  const all = getContractorScorecards();
  return all.find(c => c.contractorId === id || c.companyName.toLowerCase().includes(id.toLowerCase())) || null;
}

export function useContractorScorecards() {
  const [contractors, setContractors] = useState<ContractorScorecard[]>(INITIAL_CONTRACTOR_SCORECARDS);

  const refresh = useCallback(() => {
    setContractors(getContractorScorecards());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contractors, getContractorById, refresh };
}
