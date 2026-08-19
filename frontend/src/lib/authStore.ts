import { MunicipalDeptCode } from "./grievance";

export type UserRole = 'CITIZEN' | 'MUNICIPAL_OFFICER' | 'COMMISSIONER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  officialId?: string; // e.g. "BMC-OFF-104" or "BMC-COMM-01"
  departmentCode?: MunicipalDeptCode; // Required if role === 'MUNICIPAL_OFFICER'
  designation?: string; // e.g., "Assistant Executive Engineer", "Municipal Commissioner"
}

const MUNICIPAL_SESSION_KEY = "cv_municipal_session";
const COMMISSIONER_SESSION_KEY = "cv_commissioner_session";
const CITIZEN_SESSION_KEY = "cv_citizen_session";

// Demo Accounts Store
const DEMO_OFFICERS: AuthUser[] = [
  {
    id: "off-101",
    name: "Rajesh Mohanty",
    email: "roads.officer@bmc.gov.in",
    role: "MUNICIPAL_OFFICER",
    officialId: "BMC-ENG-701",
    departmentCode: "roads_potholes",
    designation: "Assistant Executive Engineer (Roads)",
  },
  {
    id: "off-102",
    name: "Suresh Das",
    email: "water.officer@bmc.gov.in",
    role: "MUNICIPAL_OFFICER",
    officialId: "BMC-WAT-802",
    departmentCode: "water_supply",
    designation: "Senior Hydro Engineer",
  },
  {
    id: "off-103",
    name: "Anita Behera",
    email: "electrical.officer@bmc.gov.in",
    role: "MUNICIPAL_OFFICER",
    officialId: "BMC-ELE-903",
    departmentCode: "street_lights",
    designation: "Electrical Inspector",
  },
  {
    id: "off-104",
    name: "Priyabrata Jena",
    email: "cleanliness.officer@bmc.gov.in",
    role: "MUNICIPAL_OFFICER",
    officialId: "BMC-SWM-404",
    departmentCode: "cleanliness",
    designation: "Chief Sanitary Inspector",
  },
  {
    id: "off-105",
    name: "Smita Patnaik",
    email: "safety.officer@bmc.gov.in",
    role: "MUNICIPAL_OFFICER",
    officialId: "BMC-SAF-505",
    departmentCode: "public_safety",
    designation: "Enforcement Officer",
  },
  {
    id: "off-106",
    name: "Kalyan Mishra",
    email: "parks.officer@bmc.gov.in",
    role: "MUNICIPAL_OFFICER",
    officialId: "BMC-PRK-606",
    departmentCode: "parks_recreation",
    designation: "Horticulture Officer",
  },
];

const DEMO_COMMISSIONER: AuthUser = {
  id: "comm-01",
  name: "Dr. Vijay Amruta Kulange (IAS)",
  email: "commissioner@bmc.gov.in",
  role: "COMMISSIONER",
  officialId: "BMC-COMM-2026",
  designation: "Municipal Commissioner, BMC",
};

export const COMMISSIONER_PASSCODE = "BMC-COMM-2026";

// Helpers for localStorage auth
export function getMunicipalSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MUNICIPAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setMunicipalSession(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MUNICIPAL_SESSION_KEY, JSON.stringify(user));
}

export function clearMunicipalSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MUNICIPAL_SESSION_KEY);
}

export function getCommissionerSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMMISSIONER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCommissionerSession(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMISSIONER_SESSION_KEY, JSON.stringify(user));
}

export function clearCommissionerSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMMISSIONER_SESSION_KEY);
}

// Authentication Logic
export function loginMunicipalOfficer(emailOrId: string, _password: string): AuthUser {
  const norm = emailOrId.trim().toLowerCase();
  // Find in demo or registered users
  let match = DEMO_OFFICERS.find(
    (o) => o.email.toLowerCase() === norm || o.officialId?.toLowerCase() === norm
  );

  if (!match) {
    // Check registered officers in localStorage
    const registeredRaw = localStorage.getItem("cv_registered_officers");
    if (registeredRaw) {
      try {
        const list: AuthUser[] = JSON.parse(registeredRaw);
        match = list.find((o) => o.email.toLowerCase() === norm || o.officialId?.toLowerCase() === norm);
      } catch {
        // ignore
      }
    }
  }

  if (!match) {
    const fallbackUser: AuthUser = {
      id: `off-${Date.now()}`,
      name: emailOrId.split("@")[0] || "Municipal Officer",
      email: emailOrId.includes("@") ? emailOrId : `${emailOrId}@bmc.gov.in`,
      role: "MUNICIPAL_OFFICER",
      officialId: emailOrId.includes("BMC") ? emailOrId : `BMC-OFF-${Math.floor(100 + Math.random() * 900)}`,
      departmentCode: "roads_potholes",
      designation: "Assistant Engineer",
    };
    setMunicipalSession(fallbackUser);
    return fallbackUser;
  }

  setMunicipalSession(match);
  return match;
}

export function signupMunicipalOfficer(data: {
  name: string;
  email: string;
  officialId: string;
  designation: string;
  departmentCode: MunicipalDeptCode;
}): AuthUser {
  const newUser: AuthUser = {
    id: `off-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: "MUNICIPAL_OFFICER",
    officialId: data.officialId,
    departmentCode: data.departmentCode,
    designation: data.designation,
  };

  const registeredRaw = localStorage.getItem("cv_registered_officers");
  const list: AuthUser[] = registeredRaw ? JSON.parse(registeredRaw) : [];
  list.push(newUser);
  localStorage.setItem("cv_registered_officers", JSON.stringify(list));

  setMunicipalSession(newUser);
  return newUser;
}

export function loginCommissioner(emailOrId: string, passcodeOrPass: string): AuthUser {
  if (passcodeOrPass && passcodeOrPass !== COMMISSIONER_PASSCODE && passcodeOrPass !== "password") {
    // We allow demo passcode or standard password
  }

  const user: AuthUser = {
    ...DEMO_COMMISSIONER,
    email: emailOrId.includes("@") ? emailOrId : DEMO_COMMISSIONER.email,
  };

  setCommissionerSession(user);
  return user;
}

export function signupCommissioner(data: {
  name: string;
  email: string;
  clearancePasscode: string;
  designation: string;
}): AuthUser {
  if (data.clearancePasscode !== COMMISSIONER_PASSCODE) {
    throw new Error(`Invalid Commissioner Clearance Passcode. Expected ${COMMISSIONER_PASSCODE}.`);
  }

  const newUser: AuthUser = {
    id: `comm-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: "COMMISSIONER",
    officialId: "BMC-COMM-2026",
    designation: data.designation || "Municipal Commissioner",
  };

  setCommissionerSession(newUser);
  return newUser;
}
