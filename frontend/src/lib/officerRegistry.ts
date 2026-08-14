/*
 * ── SECURITY DISCLOSURE ───────────────────────────────────────────────────────
 * Prototype only, intentionally low-friction for local testing: SHA-256 without
 * salt (not bcrypt/argon2-equivalent), no server-side verification, lockout
 * thresholds loosened for testability, email domain check is non-blocking,
 * demo credentials visible in the UI. None of this is suitable for a real
 * deployment — replace with a real backend, server-issued invites, proper
 * password hashing, and remove the demo-credentials box and any domain-check
 * leniency before handling real user data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { OfficerUser, OfficerSession } from "./types";
import { hashPassword, verifyPassword } from "./hash";

interface AdminAuditLogEntry {
  id: string;
  eventType: "signup" | "login" | "login_failed" | "password_reset" | "lockout";
  officerId: string | null;
  department: string | null;
  timestamp: string;
  detail: string;
}

export const OFFICER_REGISTRY_KEY = "civic_voice_officers_master_v3";
export const ADMIN_SESSION_KEY = "civic_voice_admin_session_v3";
export const AUDIT_LOG_KEY = "civic_voice_admin_audit_log";
export const MAX_FAILED_ATTEMPTS = 8;
export const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

const OFFICER_MIGRATION_FLAG_KEY = "civic_voice_officer_migration_v3_done";

export function migrateLegacyOfficerData(): void {
  if (typeof window === "undefined") return;

  const done = localStorage.getItem(OFFICER_MIGRATION_FLAG_KEY);
  if (done === "true") return;

  const removedKeys: string[] = [];
  const keysToScan = Object.keys(localStorage);
  let migratedOfficers: OfficerUser[] = [];

  // Look for legacy officer keys
  keysToScan.forEach((key) => {
    if ((key.includes("officer") || key.includes("admin")) && key !== OFFICER_REGISTRY_KEY && key !== ADMIN_SESSION_KEY) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            // Merge into migrated list
            parsed.forEach((item: any) => {
              if (item && item.officerId && item.officialEmail) {
                migratedOfficers.push(item);
              }
            });
          }
        }
      } catch {
        // ignore malformed
      }
      localStorage.removeItem(key);
      removedKeys.push(key);
    }
  });

  // Deduplicate by officerId
  const uniqueOfficersMap = new Map<string, OfficerUser>();
  migratedOfficers.forEach((o) => {
    const idKey = o.officerId.trim().toUpperCase();
    const existing = uniqueOfficersMap.get(idKey);
    if (!existing) {
      uniqueOfficersMap.set(idKey, o);
    } else {
      // Keep the one matching seed emails or newer
      const seedEmails = ["yashdeo1@civicvoice.gov.in", "admin@civicvoice.gov.in"];
      if (seedEmails.includes(o.officialEmail.toLowerCase().trim())) {
        uniqueOfficersMap.set(idKey, o);
      }
    }
  });

  const dedupedList = Array.from(uniqueOfficersMap.values());
  if (dedupedList.length > 0) {
    localStorage.setItem(OFFICER_REGISTRY_KEY, JSON.stringify(dedupedList));
  }

  console.log("[officer migration] deduped/removed:", removedKeys);
  localStorage.setItem(OFFICER_MIGRATION_FLAG_KEY, "true");
  seedOfficersIfEmpty();
}

export function seedOfficersIfEmpty(): void {
  if (typeof window === "undefined") return;

  const done = localStorage.getItem(OFFICER_MIGRATION_FLAG_KEY);
  if (done !== "true") {
    migrateLegacyOfficerData();
  }

  const existing = localStorage.getItem(OFFICER_REGISTRY_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    const seed = async () => {
      const hash = await hashPassword("Admin@123");
      const officers: OfficerUser[] = [
        {
          id: "off_yashdeo",
          officerId: "OFF-8586",
          name: "YASH DEO",
          officialEmail: "yashdeo1@civicvoice.gov.in",
          phone: null,
          department: "Central Municipal Administration",
          passwordHash: hash,
          role: "admin",
          failedAttempts: 0,
          lockedUntil: null,
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        },
        {
          id: "off_aditya",
          officerId: "OFF-1001",
          name: "Aditya Sharma",
          officialEmail: "admin@civicvoice.gov.in",
          phone: null,
          department: "Central Municipal Administration",
          passwordHash: hash,
          role: "admin",
          failedAttempts: 0,
          lockedUntil: null,
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        },
      ];
      localStorage.setItem(OFFICER_REGISTRY_KEY, JSON.stringify(officers));
    };
    seed();
  }
}

export function getOfficers(): OfficerUser[] {
  if (typeof window === "undefined") return [];
  seedOfficersIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(OFFICER_REGISTRY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function findOfficerByEmail(email: string): OfficerUser | null {
  const officers = getOfficers();
  const searchEmail = email.trim().toLowerCase();
  return officers.find((o) => o.officialEmail.trim().toLowerCase() === searchEmail) || null;
}

export function isOfficerIdTaken(officerId: string): boolean {
  const officers = getOfficers();
  const searchId = officerId.trim().toUpperCase();
  return officers.some((o) => o.officerId.trim().toUpperCase() === searchId);
}

export function isEmailTaken(email: string): boolean {
  return findOfficerByEmail(email) !== null;
}

export async function registerOfficer(data: {
  name: string;
  officerId: string;
  officialEmail: string;
  phone: string | null;
  password: string;
}): Promise<
  | { ok: true; user: OfficerUser }
  | { ok: false; reason: "officer_id_taken" | "email_taken" }
> {
  seedOfficersIfEmpty();

  const cleanId = data.officerId.trim().toUpperCase();
  const cleanEmail = data.officialEmail.trim().toLowerCase();

  // Synchronous checks at write time inside registerOfficer
  if (isOfficerIdTaken(cleanId)) {
    return { ok: false, reason: "officer_id_taken" };
  }
  if (isEmailTaken(cleanEmail)) {
    return { ok: false, reason: "email_taken" };
  }

  const hash = await hashPassword(data.password);
  const newOfficer: OfficerUser = {
    id: `off_${Math.random().toString(36).substring(2, 9)}`,
    officerId: cleanId,
    name: data.name.trim(),
    officialEmail: cleanEmail,
    phone: data.phone,
    department: "Central Municipal Administration",
    passwordHash: hash,
    role: "officer",
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  const officers = getOfficers();
  officers.push(newOfficer);
  localStorage.setItem(OFFICER_REGISTRY_KEY, JSON.stringify(officers));

  logAuditEvent({
    eventType: "signup",
    officerId: cleanId,
    detail: "Officer self-registered successfully.",
  });

  return { ok: true, user: newOfficer };
}

export async function attemptAdminLogin(
  email: string,
  password: string
): Promise<
  | { ok: true; user: OfficerUser }
  | { ok: false; reason: "not_found" | "wrong_password" | "locked"; lockedUntil?: string }
> {
  const user = findOfficerByEmail(email);
  if (!user) {
    return { ok: false, reason: "not_found" };
  }

  const now = new Date();

  // Check lockout
  if (user.lockedUntil) {
    const lockTime = new Date(user.lockedUntil);
    if (lockTime > now) {
      return { ok: false, reason: "locked", lockedUntil: user.lockedUntil };
    } else {
      user.lockedUntil = null;
      user.failedAttempts = 0;
    }
  }

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
  const officers = getOfficers();
  const idx = officers.findIndex((o) => o.officialEmail.toLowerCase().trim() === user.officialEmail.toLowerCase().trim());

  if (!isPasswordCorrect) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      logAuditEvent({
        eventType: "lockout",
        officerId: user.officerId,
        detail: `Officer account locked due to ${MAX_FAILED_ATTEMPTS} failed attempts.`,
      });
    }

    if (idx !== -1) {
      officers[idx] = user;
      localStorage.setItem(OFFICER_REGISTRY_KEY, JSON.stringify(officers));
    }

    logAuditEvent({
      eventType: "login_failed",
      officerId: user.officerId,
      detail: "Invalid password attempt.",
    });

    return { ok: false, reason: "wrong_password" };
  }

  // Password correct
  user.failedAttempts = 0;
  user.lastLoginAt = now.toISOString();

  if (idx !== -1) {
    officers[idx] = user;
    localStorage.setItem(OFFICER_REGISTRY_KEY, JSON.stringify(officers));
  }

  logAuditEvent({
    eventType: "login",
    officerId: user.officerId,
    detail: "Officer logged in successfully.",
  });

  return { ok: true, user };
}

export function getAdminSession(): OfficerSession | null {
  if (typeof window === "undefined") return null;
  const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionStr) return null;
  try {
    const session: OfficerSession = JSON.parse(sessionStr);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function logAuditEvent(entry: {
  eventType: "signup" | "login" | "login_failed" | "password_reset" | "lockout";
  officerId: string | null;
  detail: string;
}): void {
  if (typeof window === "undefined") return;
  const logs: AdminAuditLogEntry[] = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || "[]");
  const newEntry: AdminAuditLogEntry = {
    id: `audit_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    eventType: entry.eventType,
    officerId: entry.officerId,
    department: "Central Municipal Administration",
    timestamp: new Date().toISOString(),
    detail: entry.detail,
  };
  logs.push(newEntry);
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}
