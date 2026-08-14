export type OfficerRole = "officer" | "admin";

export interface OfficerUser {
  id: string;
  officerId: string;
  name: string;
  officialEmail: string;
  phone: string | null;
  department: string;
  passwordHash: string;
  role: OfficerRole;
  failedAttempts: number;
  lockedUntil: string | null; // ISO string or null
  createdAt: string;
  lastLoginAt: string | null;
}

export interface RegistrationCode {
  code: string;
  department: string;
  expiresAt: string; // ISO string
  maxUses: number;
  usesRemaining: number;
}

export interface OfficerSession {
  officerId: string;
  role: OfficerRole;
  token: string;
  issuedAt: string;
  expiresAt: string;
}

export type FieldError = string | null;

export interface SignupFormState {
  step: 0 | 1 | 2 | 3;
  registrationCode: string;
  resolvedDepartment: string | null;
  name: string;
  officerId: string;
  officialEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  confirmedAccurate: boolean;
}
