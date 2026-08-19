"use client";

import { useState, useEffect, useCallback } from 'react';
import { WardEmergencyBroadcast, ScheduledUtilityOutage, BroadcastSeverity } from './types/advancedFeatures';
import { INITIAL_EMERGENCY_BROADCASTS, INITIAL_SCHEDULED_OUTAGES } from './seedAdvancedData';
import { MunicipalDeptCode } from './grievance';

export const BROADCASTS_STORE_KEY = "civic_voice_broadcasts_v1";
export const OUTAGES_STORE_KEY = "civic_voice_outages_v1";
export const BROADCAST_SYNC_EVENT = "civic_voice_broadcast_sync_v1";

export function getEmergencyBroadcasts(): WardEmergencyBroadcast[] {
  if (typeof window === "undefined") return INITIAL_EMERGENCY_BROADCASTS;
  try {
    const raw = localStorage.getItem(BROADCASTS_STORE_KEY);
    if (!raw) {
      localStorage.setItem(BROADCASTS_STORE_KEY, JSON.stringify(INITIAL_EMERGENCY_BROADCASTS));
      return INITIAL_EMERGENCY_BROADCASTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(BROADCASTS_STORE_KEY, JSON.stringify(INITIAL_EMERGENCY_BROADCASTS));
      return INITIAL_EMERGENCY_BROADCASTS;
    }
    return parsed.map((item: any) => ({
      ...item,
      isActive: item.isActive !== undefined ? item.isActive : true,
      targetWards: item.targetWards || item.targetWardIds || ["BMC Ward 3", "BMC Ward 7", "BMC Ward 11", "BMC Ward 15"],
      targetWardIds: item.targetWardIds || item.targetWards || ["BMC Ward 3", "BMC Ward 7", "BMC Ward 11", "BMC Ward 15"],
    }));
  } catch {
    return INITIAL_EMERGENCY_BROADCASTS;
  }
}

export function getScheduledOutages(): ScheduledUtilityOutage[] {
  if (typeof window === "undefined") return INITIAL_SCHEDULED_OUTAGES;
  try {
    const raw = localStorage.getItem(OUTAGES_STORE_KEY);
    if (!raw) {
      localStorage.setItem(OUTAGES_STORE_KEY, JSON.stringify(INITIAL_SCHEDULED_OUTAGES));
      return INITIAL_SCHEDULED_OUTAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHEDULED_OUTAGES;
  }
}

export function publishBroadcast(data: {
  targetWardIds: string[];
  targetWards?: string[];
  severity: BroadcastSeverity;
  headline: string;
  body: string;
  emergencyDepartment: MunicipalDeptCode;
  emergencyHelpline: string;
  pumpDeploymentLocation?: string;
}): WardEmergencyBroadcast {
  const current = getEmergencyBroadcasts();
  const wards = data.targetWards || data.targetWardIds;
  const newBroadcast: WardEmergencyBroadcast = {
    ...data,
    id: `EMG-${Date.now()}`,
    targetWardIds: wards,
    targetWards: wards,
    isActive: true,
    activeFrom: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  };

  const updated = [newBroadcast, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(BROADCASTS_STORE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BROADCAST_SYNC_EVENT));
  }
  return newBroadcast;
}

export function useBroadcasts() {
  const [broadcasts, setBroadcasts] = useState<WardEmergencyBroadcast[]>(INITIAL_EMERGENCY_BROADCASTS);
  const [outages, setOutages] = useState<ScheduledUtilityOutage[]>(INITIAL_SCHEDULED_OUTAGES);

  const refresh = useCallback(() => {
    setBroadcasts(getEmergencyBroadcasts());
    setOutages(getScheduledOutages());
  }, []);

  useEffect(() => {
    refresh();
    const handleSync = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener(BROADCAST_SYNC_EVENT, handleSync);
      window.addEventListener("storage", handleSync);
      return () => {
        window.removeEventListener(BROADCAST_SYNC_EVENT, handleSync);
        window.removeEventListener("storage", handleSync);
      };
    }
  }, [refresh]);

  return { broadcasts, outages, publishBroadcast, refresh };
}
