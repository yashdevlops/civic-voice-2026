"use client";

import { useState, useEffect, useCallback } from 'react';
import { CivicCreditProfile, NearbyVerificationMission } from './types/advancedFeatures';
import { INITIAL_CIVIC_CREDIT_PROFILE, INITIAL_VERIFICATION_MISSIONS } from './seedAdvancedData';
import { addNotification } from './notificationStore';

export const CIVIC_CREDIT_STORE_KEY = "civic_voice_credit_profile_v1";
export const VERIFICATION_MISSIONS_KEY = "civic_voice_verification_missions_v1";
export const CIVIC_CREDIT_SYNC_EVENT = "civic_voice_credit_sync_v1";

export function getCivicCreditProfile(): CivicCreditProfile {
  if (typeof window === "undefined") return INITIAL_CIVIC_CREDIT_PROFILE;
  try {
    const raw = localStorage.getItem(CIVIC_CREDIT_STORE_KEY);
    if (!raw) {
      localStorage.setItem(CIVIC_CREDIT_STORE_KEY, JSON.stringify(INITIAL_CIVIC_CREDIT_PROFILE));
      return INITIAL_CIVIC_CREDIT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CIVIC_CREDIT_PROFILE;
  }
}

export function getVerificationMissions(): NearbyVerificationMission[] {
  if (typeof window === "undefined") return INITIAL_VERIFICATION_MISSIONS;
  try {
    const raw = localStorage.getItem(VERIFICATION_MISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(VERIFICATION_MISSIONS_KEY, JSON.stringify(INITIAL_VERIFICATION_MISSIONS));
      return INITIAL_VERIFICATION_MISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VERIFICATION_MISSIONS;
  }
}

export function completeCommunityAudit(missionId: string, proofPhotoUrl?: string): CivicCreditProfile {
  const profile = getCivicCreditProfile();
  const missions = getVerificationMissions();

  const mIdx = missions.findIndex(m => m.id === missionId);
  if (mIdx !== -1) {
    const reward = missions[mIdx].rewardCredits || 25;
    missions[mIdx].status = 'AUDITED_VALID';
    localStorage.setItem(VERIFICATION_MISSIONS_KEY, JSON.stringify(missions));

    profile.totalCredits += reward;
    profile.verifiedActionsCount += 1;

    // Update Tier if applicable
    if (profile.totalCredits >= 300) {
      profile.tier = 'GOLD_CIVIC_LEADER';
    } else if (profile.totalCredits >= 100) {
      profile.tier = 'SILVER_GUARDIAN';
    }

    localStorage.setItem(CIVIC_CREDIT_STORE_KEY, JSON.stringify(profile));

    try {
      addNotification({
        type: 'vote_counted',
        title: `🌱 +${reward} Civic Credits Earned!`,
        message: `Your community audit for "${missions[mIdx].title}" was validated! Total Balance: ${profile.totalCredits} Credits.`,
        iconType: 'vote',
      });
    } catch {
      // safe fallback
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CIVIC_CREDIT_SYNC_EVENT));
    }
  }

  return profile;
}

export function useCivicCredits() {
  const [profile, setProfile] = useState<CivicCreditProfile>(INITIAL_CIVIC_CREDIT_PROFILE);
  const [missions, setMissions] = useState<NearbyVerificationMission[]>(INITIAL_VERIFICATION_MISSIONS);

  const refresh = useCallback(() => {
    setProfile(getCivicCreditProfile());
    setMissions(getVerificationMissions());
  }, []);

  useEffect(() => {
    refresh();
    const handleSync = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener(CIVIC_CREDIT_SYNC_EVENT, handleSync);
      window.addEventListener("storage", handleSync);
      return () => {
        window.removeEventListener(CIVIC_CREDIT_SYNC_EVENT, handleSync);
        window.removeEventListener("storage", handleSync);
      };
    }
  }, [refresh]);

  return { profile, missions, completeAudit: completeCommunityAudit, refresh };
}
