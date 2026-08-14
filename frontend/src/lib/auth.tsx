"use client";

/*
 * ── SECURITY DISCLOSURE ───────────────────────────────────────────────────────
 * This is a prototype auth system for demo purposes only. It does not provide real security:
 * - Passwords are hashed client-side with no salt/pepper and no server verification — anyone with browser dev tools can read the user registry.
 * - There is no CSRF protection, no HttpOnly session cookies, and no rate limiting that survives a page refresh.
 * - Before any real deployment, replace this with a real backend (NextAuth.js, Clerk, or a custom API) doing server-side password hashing (bcrypt/argon2), HttpOnly session cookies, and real OTP delivery via a provider like Twilio/MSG91.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { OfficerUser } from "./types";

export type UserRole = "citizen" | "officer" | "admin";

export interface CitizenUser {
  id: string;
  name: string;
  email: string | null;      // lowercase, trimmed
  phone: string | null;      // normalized to +91XXXXXXXXXX
  passwordHash: string;      // SHA-256 client-side hash
  authProvider: "password" | "google" | "phone_otp";
  role: "citizen";
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Session {
  userId: string;
  role: UserRole;
  token: string;
  issuedAt: string;
  expiresAt: string;
  remember: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role: "citizen" | "admin" | "officer";
  avatarUrl?: string;
  token: string;
  department?: string;
  officerId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Citizen flows
  login: (emailOrPhone: string, password: string, remember: boolean) => Promise<AuthUser>;
  signup: (name: string, email: string | null, phone: string | null, password: string) => Promise<AuthUser>;
  loginWithGoogle: (email: string, name: string) => Promise<{ user: AuthUser; isNew: boolean }>;
  loginWithOtp: (phone: string, name?: string) => Promise<AuthUser>;
  verifyIdentifier: (identifier: string) => Promise<boolean>;
  resetPassword: (identifier: string, newPassword: string) => Promise<void>;
  
  // Admin / Officer flows
  adminLogin: (officerId: string, email: string, password: string) => Promise<AuthUser>;
  adminResetPassword: (officerId: string, email: string, newPassword: string) => Promise<void>;
  
  // Shared
  logout: () => void;
  updateUserProfile: (name: string, email: string, phone: string, location: string) => void;
  updateProfile: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Storage keys
const CITIZENS_KEY = "civic_voice_registered_users";
const OFFICERS_KEY = "civic_voice_officer_registry";
const SESSION_KEY = "civic_voice_session";

// Hash function helper (SHA-256 client side)
export async function hashPassword(password: string): Promise<string> {
  // NOT a substitute for server-side bcrypt/argon2 — see Security Disclosure
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── 1. Registry Initialization ─────────────────────────────────────────────
  useEffect(() => {
    async function initRegistry() {
      if (typeof window === "undefined") return;

      try {
        // Seed Officers/Admins if not exists
        if (!localStorage.getItem(OFFICERS_KEY)) {
          const defaultPasswordHash = await hashPassword("Password123!");
          const defaultOfficers: OfficerUser[] = [
            {
              id: "off_aditya",
              officerId: "OFF-9824",
              name: "Aditya Sharma",
              officialEmail: "aditya.sharma@civicvoice.gov.in",
              phone: null,
              passwordHash: defaultPasswordHash,
              role: "admin",
              department: "Roads & Traffic Dept",
              createdAt: new Date().toISOString(),
              lastLoginAt: null,
              failedAttempts: 0,
              lockedUntil: null,
            },
            {
              id: "off_rajesh",
              officerId: "OFF-1234",
              name: "Rajesh Kumar",
              officialEmail: "rajesh.kumar@civicvoice.gov.in",
              phone: null,
              passwordHash: defaultPasswordHash,
              role: "officer",
              department: "Sanitation & Waste",
              createdAt: new Date().toISOString(),
              lastLoginAt: null,
              failedAttempts: 0,
              lockedUntil: null,
            },
          ];
          localStorage.setItem(OFFICERS_KEY, JSON.stringify(defaultOfficers));
        }

        // Seed Citizens if not exists
        if (!localStorage.getItem(CITIZENS_KEY)) {
          const defaultPasswordHash = await hashPassword("Password123!");
          const defaultCitizens: CitizenUser[] = [
            {
              id: "cit_demo",
              name: "Priyanshu Chandra",
              email: "citizen@example.com",
              phone: "+919876543210",
              passwordHash: defaultPasswordHash,
              authProvider: "password",
              role: "citizen",
              createdAt: new Date().toISOString(),
              lastLoginAt: null,
            },
          ];
          localStorage.setItem(CITIZENS_KEY, JSON.stringify(defaultCitizens));
        }

        // Load Session if exists
        let savedSessionStr = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
        if (savedSessionStr) {
          const session: Session = JSON.parse(savedSessionStr);
          // Check expiration (session valid for 7 days)
          if (new Date(session.expiresAt) > new Date()) {
            // Find active user
            if (session.role === "citizen") {
              const citizens: CitizenUser[] = JSON.parse(localStorage.getItem(CITIZENS_KEY) || "[]");
              const citizen = citizens.find((c) => c.id === session.userId);
              if (citizen) {
                setUser({
                  id: citizen.id,
                  name: citizen.name,
                  email: citizen.email || "",
                  phone: citizen.phone || undefined,
                  role: "citizen",
                  token: session.token,
                  location: "Bengaluru, Karnataka",
                });
              }
            } else {
              const officers: OfficerUser[] = JSON.parse(localStorage.getItem(OFFICERS_KEY) || "[]");
              const officer = officers.find((o) => o.id === session.userId);
              if (officer) {
                setUser({
                  id: officer.id,
                  name: officer.name,
                  email: officer.officialEmail,
                  role: officer.role,
                  token: session.token,
                  department: officer.department || undefined,
                  officerId: officer.officerId,
                  location: "Municipal HQ, Bengaluru",
                });
              }
            }
          } else {
            // Expired
            localStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (err) {
        console.error("[AuthProvider] Initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initRegistry();
  }, []);

  // Helper: Get registry lists
  const getCitizens = (): CitizenUser[] => JSON.parse(localStorage.getItem(CITIZENS_KEY) || "[]");
  const saveCitizens = (list: CitizenUser[]) => localStorage.setItem(CITIZENS_KEY, JSON.stringify(list));
  const getOfficers = (): OfficerUser[] => JSON.parse(localStorage.getItem(OFFICERS_KEY) || "[]");
  const saveOfficers = (list: OfficerUser[]) => localStorage.setItem(OFFICERS_KEY, JSON.stringify(list));

  // Helper: Normalize phone to +91XXXXXXXXXX
  const normalizePhone = (phone: string): string => {
    let clean = phone.replace(/\D/g, "");
    if (clean.length === 10) return `+91${clean}`;
    if (clean.length === 12 && clean.startsWith("91")) return `+${clean}`;
    return `+${clean}`;
  };

  // Helper: Create session
  const createSession = (userId: string, role: UserRole, remember: boolean): Session => {
    const expires = new Date();
    expires.setDate(expires.getDate() + (remember ? 30 : 1)); // 30 days or 1 day
    const session: Session = {
      userId,
      role,
      token: `mock_token_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      issuedAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
      remember,
    };
    const serialized = JSON.stringify(session);
    if (remember) {
      localStorage.setItem(SESSION_KEY, serialized);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, serialized);
      localStorage.removeItem(SESSION_KEY);
    }
    return session;
  };

  // ── 2. Citizen Login ───────────────────────────────────────────────────────
  const login = useCallback(async (emailOrPhone: string, password: string, remember: boolean): Promise<AuthUser> => {
    await new Promise((res) => setTimeout(res, 800)); // Premium feel latency
    const normalized = emailOrPhone.trim().toLowerCase();
    const isEmail = normalized.includes("@");
    
    const citizens = getCitizens();
    let citizen: CitizenUser | undefined;

    if (isEmail) {
      citizen = citizens.find((c) => c.email === normalized && c.authProvider === "password");
    } else {
      const normalizedPhone = normalizePhone(normalized);
      citizen = citizens.find((c) => c.phone === normalizedPhone && c.authProvider === "password");
    }

    if (!citizen) {
      throw new Error("No account found with these credentials. Please sign up.");
    }

    const hashedInput = await hashPassword(password);
    if (citizen.passwordHash !== hashedInput) {
      throw new Error("Invalid credentials. Incorrect password.");
    }

    // Update lastLoginAt
    citizen.lastLoginAt = new Date().toISOString();
    saveCitizens(citizens);

    const session = createSession(citizen.id, "citizen", remember);
    const authUser: AuthUser = {
      id: citizen.id,
      name: citizen.name,
      email: citizen.email || "",
      phone: citizen.phone || undefined,
      role: "citizen",
      token: session.token,
      location: "Bengaluru, Karnataka",
    };

    setUser(authUser);
    return authUser;
  }, []);

  // ── 3. Citizen Signup ──────────────────────────────────────────────────────
  const signup = useCallback(async (name: string, email: string | null, phone: string | null, password: string): Promise<AuthUser> => {
    await new Promise((res) => setTimeout(res, 800));
    
    const citizens = getCitizens();
    const emailNorm = email ? email.trim().toLowerCase() : null;
    const phoneNorm = phone ? normalizePhone(phone.trim()) : null;

    // Check conflict
    if (emailNorm && citizens.some((c) => c.email === emailNorm)) {
      throw new Error("An account already exists with this email address.");
    }
    if (phoneNorm && citizens.some((c) => c.phone === phoneNorm)) {
      throw new Error("An account already exists with this phone number.");
    }

    const passwordHash = await hashPassword(password);
    const newCitizen: CitizenUser = {
      id: `cit_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      email: emailNorm,
      phone: phoneNorm,
      passwordHash,
      authProvider: "password",
      role: "citizen",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    citizens.push(newCitizen);
    saveCitizens(citizens);

    const session = createSession(newCitizen.id, "citizen", false);
    const authUser: AuthUser = {
      id: newCitizen.id,
      name: newCitizen.name,
      email: newCitizen.email || "",
      phone: newCitizen.phone || undefined,
      role: "citizen",
      token: session.token,
      location: "Bengaluru, Karnataka",
    };

    setUser(authUser);
    return authUser;
  }, []);

  // ── 4. Google Login (Simulated) ────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (email: string, name: string): Promise<{ user: AuthUser; isNew: boolean }> => {
    await new Promise((res) => setTimeout(res, 800));
    const emailNorm = email.trim().toLowerCase();
    
    const citizens = getCitizens();
    let citizen = citizens.find((c) => c.email === emailNorm);
    let isNew = false;

    if (!citizen) {
      isNew = true;
      citizen = {
        id: `google_${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim(),
        email: emailNorm,
        phone: null,
        passwordHash: "", // Google accounts don't initially have a local password
        authProvider: "google",
        role: "citizen",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      citizens.push(citizen);
      saveCitizens(citizens);
    } else {
      citizen.lastLoginAt = new Date().toISOString();
      saveCitizens(citizens);
    }

    const session = createSession(citizen.id, "citizen", true);
    const authUser: AuthUser = {
      id: citizen.id,
      name: citizen.name,
      email: citizen.email || "",
      phone: citizen.phone || undefined,
      role: "citizen",
      token: session.token,
      location: "Bengaluru, Karnataka",
    };

    setUser(authUser);
    return { user: authUser, isNew };
  }, []);

  // ── 5. Phone OTP Login ─────────────────────────────────────────────────────
  const loginWithOtp = useCallback(async (phone: string, name?: string): Promise<AuthUser> => {
    await new Promise((res) => setTimeout(res, 800));
    const phoneNorm = normalizePhone(phone.trim());
    
    const citizens = getCitizens();
    let citizen = citizens.find((c) => c.phone === phoneNorm);

    if (!citizen) {
      // Auto-signup
      const last4 = phoneNorm.slice(-4);
      citizen = {
        id: `otp_${Math.random().toString(36).substring(2, 9)}`,
        name: name || `Citizen ${last4}`,
        email: null,
        phone: phoneNorm,
        passwordHash: "",
        authProvider: "phone_otp",
        role: "citizen",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      citizens.push(citizen);
      saveCitizens(citizens);
    } else {
      citizen.lastLoginAt = new Date().toISOString();
      saveCitizens(citizens);
    }

    const session = createSession(citizen.id, "citizen", true);
    const authUser: AuthUser = {
      id: citizen.id,
      name: citizen.name,
      email: citizen.email || "",
      phone: citizen.phone || undefined,
      role: "citizen",
      token: session.token,
      location: "Bengaluru, Karnataka",
    };

    setUser(authUser);
    return authUser;
  }, []);

  // ── 6. Verification and Password Reset ─────────────────────────────────────
  const verifyIdentifier = useCallback(async (identifier: string): Promise<boolean> => {
    const target = identifier.trim().toLowerCase();
    const isEmail = target.includes("@");
    const citizens = getCitizens();
    
    let exists = false;
    if (isEmail) {
      exists = citizens.some((c) => c.email === target);
    } else {
      const phoneNorm = normalizePhone(target);
      exists = citizens.some((c) => c.phone === phoneNorm);
    }
    
    return exists;
  }, []);

  const resetPassword = useCallback(async (identifier: string, newPassword: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 800));
    const target = identifier.trim().toLowerCase();
    const isEmail = target.includes("@");
    
    const citizens = getCitizens();
    let citizen: CitizenUser | undefined;

    if (isEmail) {
      citizen = citizens.find((c) => c.email === target);
    } else {
      const phoneNorm = normalizePhone(target);
      citizen = citizens.find((c) => c.phone === phoneNorm);
    }

    if (!citizen) {
      throw new Error("No account found with this identifier.");
    }

    citizen.passwordHash = await hashPassword(newPassword);
    // If they were using google/otp, upgrade provider or allow password reset
    citizen.authProvider = "password"; 
    saveCitizens(citizens);
  }, []);

  // ── 7. Admin / Officer Login with Lockout ──────────────────────────────────
  const adminLogin = useCallback(async (officerId: string, email: string, password: string): Promise<AuthUser> => {
    await new Promise((res) => setTimeout(res, 800));
    const idInput = officerId.trim().toUpperCase();
    const emailInput = email.trim().toLowerCase();

    // Officer regex validations
    if (!/^OFF-\d{4,6}$/.test(idInput)) {
      throw new Error("Invalid Officer ID format. Must match OFF-XXXX.");
    }
    if (!/^[\w.-]+@civicvoice\.gov\.in$/.test(emailInput)) {
      throw new Error("Official email must be a verified civicvoice.gov.in account.");
    }

    const officers = getOfficers();
    const officer = officers.find((o) => o.officerId === idInput);

    if (!officer) {
      throw new Error("Officer ID and email do not match our records.");
    }

    // Check Lockout
    if (officer.lockedUntil) {
      const now = new Date();
      const lockTime = new Date(officer.lockedUntil);
      if (now < lockTime) {
        throw new Error(`This account is locked until ${lockTime.toLocaleTimeString()}.`);
      } else {
        // Unlock
        officer.lockedUntil = null;
        officer.failedAttempts = 0;
        saveOfficers(officers);
      }
    }

    // Verify email match on exact record
    if (officer.officialEmail !== emailInput) {
      throw new Error("Officer ID and email do not match our records.");
    }

    const hashedInput = await hashPassword(password);
    if (officer.passwordHash !== hashedInput) {
      // Increment failed attempts
      officer.failedAttempts += 1;
      if (officer.failedAttempts >= 3) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
        officer.lockedUntil = lockoutTime.toISOString();
        saveOfficers(officers);
        throw new Error(`Invalid credentials. Account locked for 15 minutes.`);
      }
      saveOfficers(officers);
      throw new Error(`Invalid credentials. Incorrect password. Attempts: ${officer.failedAttempts}/3`);
    }

    // Success
    officer.failedAttempts = 0;
    officer.lockedUntil = null;
    officer.lastLoginAt = new Date().toISOString();
    saveOfficers(officers);

    const session = createSession(officer.id, officer.role, false);
    const authUser: AuthUser = {
      id: officer.id,
      name: officer.name,
      email: officer.officialEmail,
      role: officer.role,
      token: session.token,
      department: officer.department || undefined,
      officerId: officer.officerId,
      location: "Municipal HQ, Bengaluru",
    };

    setUser(authUser);
    return authUser;
  }, []);

  const adminResetPassword = useCallback(async (officerId: string, email: string, newPassword: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 800));
    const idInput = officerId.trim().toUpperCase();
    const emailInput = email.trim().toLowerCase();

    const officers = getOfficers();
    const officer = officers.find((o) => o.officerId === idInput && o.officialEmail === emailInput);

    if (!officer) {
      throw new Error("Officer ID and official email verification failed.");
    }

    officer.passwordHash = await hashPassword(newPassword);
    officer.failedAttempts = 0;
    officer.lockedUntil = null;
    saveOfficers(officers);

    // Audit Log Simulation
    console.log(`[AUDIT] Password reset for officer ${idInput} logged at ${new Date().toISOString()}`);
    const auditLogs = JSON.parse(localStorage.getItem("civic_voice_admin_audit_log") || "[]");
    auditLogs.push({
      action: "password_reset",
      officerId: idInput,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("civic_voice_admin_audit_log", JSON.stringify(auditLogs));
  }, []);

  // ── 8. Common flows ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const previousRole = user?.role;
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);

    if (previousRole === "admin" || previousRole === "officer") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }
  }, [user]);

  const updateUserProfile = useCallback((name: string, email: string, phone: string, location: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: normalizePhone(phone.trim()),
        location: location.trim(),
      };

      // Save updated data back to registry
      if (prev.role === "citizen") {
        const citizens = getCitizens();
        const idx = citizens.findIndex((c) => c.id === prev.id);
        if (idx !== -1) {
          citizens[idx].name = updated.name;
          citizens[idx].email = updated.email;
          citizens[idx].phone = updated.phone;
          saveCitizens(citizens);
        }
      } else {
        const officers = getOfficers();
        const idx = officers.findIndex((o) => o.id === prev.id);
        if (idx !== -1) {
          officers[idx].name = updated.name;
          officers[idx].officialEmail = updated.email;
          saveOfficers(officers);
        }
      }

      // Sync active session info
      const serialized = JSON.stringify(updated);
      const isLocal = !!localStorage.getItem(SESSION_KEY);
      if (isLocal) {
        localStorage.setItem(SESSION_KEY, serialized);
      } else {
        sessionStorage.setItem(SESSION_KEY, serialized);
      }

      return updated;
    });
  }, []);

  const updateProfile = useCallback((partial: Partial<AuthUser>) => {
    updateUserProfile(
      partial.name !== undefined ? partial.name : (user?.name || ""),
      partial.email !== undefined ? partial.email : (user?.email || ""),
      partial.phone !== undefined ? partial.phone : (user?.phone || ""),
      partial.location !== undefined ? partial.location : (user?.location || "")
    );
  }, [user, updateUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithOtp,
        verifyIdentifier,
        resetPassword,
        adminLogin,
        adminResetPassword,
        logout,
        updateUserProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
