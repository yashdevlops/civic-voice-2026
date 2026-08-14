import { RegistrationCode } from "./types";

export const REGISTRATION_CODES_KEY = "civic_voice_registration_codes";

export function seedRegistrationCodesIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(REGISTRATION_CODES_KEY)) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const codes: RegistrationCode[] = [
      {
        code: "CIVIC-ENG-2026",
        department: "Engineering",
        expiresAt: futureDate.toISOString(),
        maxUses: 10,
        usesRemaining: 10,
      },
      {
        code: "CIVIC-SAN-2026",
        department: "Sanitation",
        expiresAt: futureDate.toISOString(),
        maxUses: 5,
        usesRemaining: 5,
      },
      {
        code: "CIVIC-ADMIN-EXPIRED",
        department: "General",
        expiresAt: "2020-01-01T00:00:00.000Z",
        maxUses: 5,
        usesRemaining: 5,
      },
    ];
    localStorage.setItem(REGISTRATION_CODES_KEY, JSON.stringify(codes));
  }
}

export function getRegistrationCodes(): RegistrationCode[] {
  if (typeof window === "undefined") return [];
  seedRegistrationCodesIfEmpty();
  return JSON.parse(localStorage.getItem(REGISTRATION_CODES_KEY) || "[]");
}

export function validateRegistrationCode(code: string): 
  | { ok: true; codeRecord: RegistrationCode }
  | { ok: false; reason: "not_found" | "expired" | "exhausted" } {
  const codes = getRegistrationCodes();
  const codeRecord = codes.find((c) => c.code === code.trim());

  if (!codeRecord) {
    return { ok: false, reason: "not_found" };
  }

  if (new Date(codeRecord.expiresAt) < new Date()) {
    return { ok: false, reason: "expired" };
  }

  if (codeRecord.usesRemaining <= 0) {
    return { ok: false, reason: "exhausted" };
  }

  return { ok: true, codeRecord };
}

export function consumeRegistrationCode(code: string): boolean {
  const check = validateRegistrationCode(code);
  if (!check.ok) {
    return false;
  }

  const codes = getRegistrationCodes();
  const idx = codes.findIndex((c) => c.code === code.trim());
  if (idx === -1) return false;

  if (codes[idx].usesRemaining <= 0) {
    return false;
  }

  codes[idx].usesRemaining -= 1;
  localStorage.setItem(REGISTRATION_CODES_KEY, JSON.stringify(codes));
  return true;
}
