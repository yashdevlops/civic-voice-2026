import {
  GrievanceTicket,
  ComplaintStatus,
  PriorityLevel,
  MunicipalDeptCode,
  MUNICIPAL_DEPARTMENTS,
  DistrictClusterAlert,
} from "./grievance";
import { getInitialSeedTickets } from "./seedData";
import { addNotification } from "./notificationStore";

export const GRIEVANCE_STORE_KEY = "cv_grievances_master_v6";
export const GRIEVANCE_SYNC_EVENT = "cv_grievance_sync_v6";

interface StorePayload {
  nextId: number;
  tickets: GrievanceTicket[];
}

export function seedGrievancesIfEmpty(): void {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem(GRIEVANCE_STORE_KEY);
  if (!existing) {
    const seedTickets = getInitialSeedTickets();
    const payload: StorePayload = {
      nextId: seedTickets.length + 1,
      tickets: seedTickets,
    };
    localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));
  }
}

export function getGrievances(): GrievanceTicket[] {
  if (typeof window === "undefined") return [];
  seedGrievancesIfEmpty();
  try {
    const raw = localStorage.getItem(GRIEVANCE_STORE_KEY);
    if (!raw) return [];
    const payload: StorePayload = JSON.parse(raw);
    return payload.tickets || [];
  } catch {
    return [];
  }
}

/**
 * Dynamically evaluates SLA and computed status.
 * If Date.now() > ticket.slaDeadlineAt and status is not RESOLVED or CLOSED,
 * its computed status is 'OVERDUE'.
 */
export function getComputedTickets(): GrievanceTicket[] {
  const tickets = getGrievances();
  const nowMs = Date.now();

  return tickets.map((t) => {
    const deadlineMs = new Date(t.slaDeadlineAt).getTime();
    if (
      nowMs > deadlineMs &&
      t.status !== "RESOLVED" &&
      t.status !== "CLOSED" &&
      t.status !== "OVERDUE"
    ) {
      return { ...t, status: "OVERDUE" as ComplaintStatus };
    }
    return t;
  });
}

export function getGrievanceById(id: string): GrievanceTicket | null {
  const tickets = getComputedTickets();
  return tickets.find((t) => t.id === id) || null;
}

export function getGrievancesByDept(deptCode: MunicipalDeptCode): GrievanceTicket[] {
  const tickets = getComputedTickets();
  return tickets.filter((t) => t.departmentCode === deptCode);
}

export function getGrievancesByCitizen(citizenIdOrEmail: string): GrievanceTicket[] {
  const tickets = getComputedTickets();
  const norm = citizenIdOrEmail.trim().toLowerCase();
  return tickets.filter(
    (t) =>
      t.citizenId.toLowerCase() === norm ||
      t.citizenName.toLowerCase() === norm
  );
}

/**
 * Adds a new ticket.
 * Computes slaDeadlineAt = now + defaultSlaHours.
 * Formats ID as TKT-2026-NNNN.
 * Sets status = 'NEW', supporterIds = [citizenId], upvoteCount = 1.
 */
export function addTicket(data: {
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  title: string;
  description: string;
  mediaUrls?: string[];
  latitude: number;
  longitude: number;
  addressText: string;
  landmark?: string;
  wardId: string;
  wardNumber: number;
  departmentCode: MunicipalDeptCode;
  priority?: PriorityLevel;
}): GrievanceTicket {
  seedGrievancesIfEmpty();
  const raw = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: StorePayload = { nextId: 1, tickets: [] };

  try {
    payload = JSON.parse(raw);
  } catch {
    // fallback
  }

  const now = new Date();
  const seqStr = payload.nextId.toString().padStart(4, "0");
  const ticketId = `TKT-2026-${seqStr}`;

  const deptMeta = MUNICIPAL_DEPARTMENTS[data.departmentCode];
  const slaHours = deptMeta ? deptMeta.defaultSlaHours : 48;
  const slaDeadlineAt = new Date(now.getTime() + slaHours * 3600 * 1000).toISOString();

  const newTicket: GrievanceTicket = {
    id: ticketId,
    citizenId: data.citizenId || "cit-guest",
    citizenName: data.citizenName || "Citizen User",
    citizenPhone: data.citizenPhone || "+919876543210",
    title: data.title,
    description: data.description,
    mediaUrls: data.mediaUrls || [],
    latitude: data.latitude,
    longitude: data.longitude,
    addressText: data.addressText,
    landmark: data.landmark,
    wardId: data.wardId,
    wardNumber: data.wardNumber,
    departmentCode: data.departmentCode,
    status: "NEW",
    priority: data.priority || "MEDIUM",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    slaDeadlineAt,
    reopenedCount: 0,
    supporterIds: [data.citizenId || "cit-guest"],
    upvoteCount: 1,
  };

  payload.tickets.unshift(newTicket);
  payload.nextId += 1;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  try {
    addNotification({
      type: "complaint_status",
      title: "Complaint Logged",
      message: `Your report ${ticketId} was successfully assigned to ${deptMeta?.name || "Municipal Dept"}.`,
      relatedId: ticketId,
      iconType: "info",
    });
  } catch {
    // safe fallback
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return newTicket;
}

/**
 * Transitions status from 'NEW' to 'ASSIGNED'.
 */
export function assignOfficer(
  ticketId: string,
  officerName: string,
  role?: string
): GrievanceTicket | null {
  seedGrievancesIfEmpty();
  const raw = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: StorePayload = { nextId: 1, tickets: [] };

  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  const idx = payload.tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const ticket = payload.tickets[idx];
  ticket.assignedOfficerName = officerName;
  if (role) ticket.assignedOfficerRole = role;
  if (ticket.status === "NEW" || ticket.status === "OVERDUE") {
    ticket.status = "ASSIGNED";
  }
  ticket.updatedAt = new Date().toISOString();

  payload.tickets[idx] = ticket;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return ticket;
}

/**
 * Transitions between 'ASSIGNED' and 'IN_PROGRESS'.
 */
export function updateStatus(
  ticketId: string,
  status: ComplaintStatus
): GrievanceTicket | null {
  seedGrievancesIfEmpty();
  const raw = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: StorePayload = { nextId: 1, tickets: [] };

  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  const idx = payload.tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const ticket = payload.tickets[idx];
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();

  payload.tickets[idx] = ticket;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return ticket;
}

/**
 * Sets status = 'RESOLVED', citizenVerification = 'pending', records resolutionProof.
 */
export function addResolutionProof(
  ticketId: string,
  proof: { photoUrl: string; remarks: string; officerName: string }
): GrievanceTicket | null {
  seedGrievancesIfEmpty();
  const raw = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: StorePayload = { nextId: 1, tickets: [] };

  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  const idx = payload.tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const ticket = payload.tickets[idx];
  const resolvedAt = new Date().toISOString();

  ticket.resolutionProof = {
    photoUrl: proof.photoUrl,
    remarks: proof.remarks,
    resolvedAt,
    officerName: proof.officerName,
  };
  ticket.status = "RESOLVED";
  ticket.citizenVerification = "pending";
  ticket.updatedAt = resolvedAt;

  payload.tickets[idx] = ticket;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  try {
    addNotification({
      type: "complaint_status",
      title: "Issue Resolved — Please Confirm",
      message: `${ticket.id} was marked resolved by ${proof.officerName}. Please verify.`,
      relatedId: ticket.id,
      iconType: "info",
    });
  } catch {
    // fallback
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return ticket;
}

/**
 * Handles citizen verification:
 * - 'confirm': status = 'CLOSED', citizenVerification = 'confirmed'.
 * - 'reopen': status = 'REOPENED', citizenVerification = 'reopened', priority = 'HIGH', increments reopenedCount, appends reopenReason.
 */
export function verifyResolution(
  ticketId: string,
  action: "confirm" | "reopen",
  reason?: string
): GrievanceTicket | null {
  seedGrievancesIfEmpty();
  const raw = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: StorePayload = { nextId: 1, tickets: [] };

  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  const idx = payload.tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const ticket = payload.tickets[idx];
  const nowStr = new Date().toISOString();

  if (action === "confirm") {
    ticket.status = "CLOSED";
    ticket.citizenVerification = "confirmed";
  } else {
    ticket.status = "REOPENED";
    ticket.citizenVerification = "reopened";
    ticket.priority = "HIGH";
    ticket.reopenedCount = (ticket.reopenedCount || 0) + 1;
    ticket.reopenReason = reason || "Citizen indicated issue is still present.";
  }
  ticket.updatedAt = nowStr;

  payload.tickets[idx] = ticket;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return ticket;
}

/**
 * Adds citizen support/upvote to an existing ticket.
 */
export function supportExistingTicket(
  ticketId: string,
  citizenId: string
): GrievanceTicket | null {
  seedGrievancesIfEmpty();
  const raw = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: StorePayload = { nextId: 1, tickets: [] };

  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  const idx = payload.tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const ticket = payload.tickets[idx];
  if (!ticket.supporterIds.includes(citizenId)) {
    ticket.supporterIds.push(citizenId);
    ticket.upvoteCount = (ticket.upvoteCount || 0) + 1;
    ticket.updatedAt = new Date().toISOString();
  }

  payload.tickets[idx] = ticket;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return ticket;
}

/**
 * Scans active tickets (status NOT IN ('RESOLVED', 'CLOSED')).
 * Groups by departmentCode.
 * If >= 3 distinct wardIds contain open tickets in same dept AND total unresolved count >= 4,
 * returns a synthesized DistrictClusterAlert.
 */
export function detectCrossWardClusters(): DistrictClusterAlert[] {
  const tickets = getComputedTickets();
  const active = tickets.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
  );

  const deptMap = new Map<MunicipalDeptCode, GrievanceTicket[]>();
  for (const ticket of active) {
    const code = ticket.departmentCode;
    if (!deptMap.has(code)) deptMap.set(code, []);
    deptMap.get(code)!.push(ticket);
  }

  const alerts: DistrictClusterAlert[] = [];

  deptMap.forEach((deptTickets, deptCode) => {
    const wardSet = new Set(deptTickets.map((t) => t.wardId));
    const totalSupporters = deptTickets.reduce((acc, t) => acc + (t.upvoteCount || 1), 0);

    if (wardSet.size >= 3 && deptTickets.length >= 4) {
      const deptMeta = MUNICIPAL_DEPARTMENTS[deptCode];
      alerts.push({
        id: `cluster-${deptCode}-${Date.now()}`,
        departmentCode: deptCode,
        departmentName: deptMeta ? deptMeta.name : deptCode,
        categoryLabel: deptMeta ? deptMeta.name : deptCode,
        affectedWards: Array.from(wardSet),
        unresolvedCount: deptTickets.length,
        citizensAffected: totalSupporters * 3 + 45, // estimated impacted citizens
        summary: `${deptTickets.length} unresolved complaints across ${wardSet.size} wards in ${deptMeta?.name || deptCode}`,
        createdAt: new Date().toISOString(),
        status: "ACTIVE",
      });
    }
  });

  return alerts;
}
