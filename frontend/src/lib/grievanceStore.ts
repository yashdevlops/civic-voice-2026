import { GrievanceTicket, IssueStatus, NewGrievanceInput, CATEGORY_OPTIONS } from "./grievance";

export const GRIEVANCE_STORE_KEY = "civic_voice_grievances_master_v3";
export const GRIEVANCE_SYNC_EVENT = "civic_voice_sync_event_v3";
const MIGRATION_FLAG_KEY = "civic_voice_migration_v3_done";

interface GrievancePayload {
  nextId: number;
  tickets: GrievanceTicket[];
}

export function migrateLegacyGrievanceData(): void {
  if (typeof window === "undefined") return;

  const done = localStorage.getItem(MIGRATION_FLAG_KEY);
  if (done === "true") return;

  const removedKeys: string[] = [];
  const keysToScan = Object.keys(localStorage);
  
  keysToScan.forEach((key) => {
    // Scan for all legacy grievance-related keys
    if (key.includes("grievance") && key !== GRIEVANCE_STORE_KEY) {
      localStorage.removeItem(key);
      removedKeys.push(key);
    }
  });

  // Legacy tickets used an incompatible schema (UUID ids, non-canonical status/category values).
  // Rather than risk silently mismapping citizen data, this migration clears legacy stores and reseeds clean canonical data.
  console.log("[migration] cleared legacy keys:", removedKeys);

  localStorage.setItem(MIGRATION_FLAG_KEY, "true");
  seedGrievancesIfEmpty();
}

export function seedGrievancesIfEmpty(): void {
  if (typeof window === "undefined") return;

  // Make sure migration has run first
  const done = localStorage.getItem(MIGRATION_FLAG_KEY);
  if (done !== "true") {
    migrateLegacyGrievanceData();
  }

  const existing = localStorage.getItem(GRIEVANCE_STORE_KEY);
  if (!existing) {
    const now = new Date();
    const getDateAgo = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d.toISOString();
    };

    const seedTickets: GrievanceTicket[] = [
      {
        id: "TKT-2026-0001",
        title: "Water main rupture on 100ft Road, Indiranagar",
        category: "Water Supply",
        priority: "Critical",
        status: "Pending",
        location: "100ft Road, Indiranagar, Bengaluru",
        citizenName: "Rohan Kulkarni",
        citizenEmail: "rohan.kulkarni@example.com",
        citizenPhone: "+919876543210",
        description: "A major water pipe burst here. Huge geyser and flooded road blocking traffic.",
        department: "Central Municipal Administration",
        assignedOfficer: null,
        createdAt: getDateAgo(8),
        updatedAt: getDateAgo(8),
        adminNotes: [
          {
            status: "Pending",
            changedAt: getDateAgo(8),
            note: "Ticket created automatically",
            changedByOfficerId: "system",
          },
        ],
      },
      {
        id: "TKT-2026-0002",
        title: "Hazardous open pothole near Metro Pillar 42",
        category: "Roads & Potholes",
        priority: "High",
        status: "Under Review",
        location: "MG Road, near Metro Pillar 42",
        citizenName: "Ananya Reddy",
        citizenEmail: "ananya.reddy@example.com",
        citizenPhone: "+919876543211",
        description: "Deep pothole in the middle lane, extremely dangerous for motorbikes.",
        department: "Central Municipal Administration",
        assignedOfficer: null,
        createdAt: getDateAgo(6),
        updatedAt: getDateAgo(5),
        adminNotes: [
          {
            status: "Pending",
            changedAt: getDateAgo(6),
            note: "Ticket created",
            changedByOfficerId: "system",
          },
          {
            status: "Under Review",
            changedAt: getDateAgo(5),
            note: "Checking physical proximity to metro construction coordinates",
            changedByOfficerId: "OFF-1002",
          },
        ],
      },
      {
        id: "TKT-2026-0003",
        title: "Streetlight outage on 3rd Cross, Jayanagar",
        category: "Streetlights & Electricity",
        priority: "Medium",
        status: "In Progress",
        location: "3rd Cross, Jayanagar",
        citizenName: "Vikram Singh",
        citizenEmail: "vikram.singh@example.com",
        citizenPhone: "+919876543212",
        description: "Entire street is pitch black for the past 3 nights. Safety concern.",
        department: "Central Municipal Administration",
        assignedOfficer: "Priya Sharma (OFF-1001)",
        createdAt: getDateAgo(4),
        updatedAt: getDateAgo(3),
        adminNotes: [
          {
            status: "Pending",
            changedAt: getDateAgo(4),
            note: "Ticket filed",
            changedByOfficerId: "system",
          },
          {
            status: "Under Review",
            changedAt: getDateAgo(3),
            note: "Verified streetlight outage",
            changedByOfficerId: "OFF-1001",
          },
          {
            status: "In Progress",
            changedAt: getDateAgo(3),
            note: "Dispatched ground engineer with replacement bulbs",
            changedByOfficerId: "OFF-1001",
          },
        ],
      },
      {
        id: "TKT-2026-0004",
        title: "Overflowing garbage bin, Koramangala 5th Block",
        category: "Sanitation & Waste",
        priority: "Low",
        status: "Resolved",
        location: "Koramangala 5th Block",
        citizenName: "Sneha Iyer",
        citizenEmail: "sneha.iyer@example.com",
        citizenPhone: "+919876543213",
        description: "The garbage bin at the crossroad is completely full and smelling terribly.",
        department: "Central Municipal Administration",
        assignedOfficer: null,
        createdAt: getDateAgo(2),
        updatedAt: getDateAgo(1),
        adminNotes: [
          {
            status: "Pending",
            changedAt: getDateAgo(2),
            note: "Ticket submitted",
            changedByOfficerId: "system",
          },
          {
            status: "Resolved",
            changedAt: getDateAgo(1),
            note: "Cleared bin and sanitized neighborhood area",
            changedByOfficerId: "OFF-1002",
          },
        ],
      },
      {
        id: "TKT-2026-0005",
        title: "Broken swing set at Cubbon Park children's area",
        category: "Parks & Recreation",
        priority: "Low",
        status: "Rejected",
        location: "Cubbon Park",
        citizenName: "Karan Mehta",
        citizenEmail: "karan.mehta@example.com",
        citizenPhone: "+919876543214",
        description: "One of the swings has its chains broken. Needs replacement.",
        department: "Central Municipal Administration",
        assignedOfficer: null,
        createdAt: getDateAgo(1),
        updatedAt: now.toISOString(),
        adminNotes: [
          {
            status: "Pending",
            changedAt: getDateAgo(1),
            note: "Ticket created",
            changedByOfficerId: "system",
          },
          {
            status: "Rejected",
            changedAt: now.toISOString(),
            note: "Cubbon Park maintenance falls under direct State Authority jurisdiction, not Civic municipal control.",
            changedByOfficerId: "OFF-1001",
          },
        ],
      },
    ];

    const payload: GrievancePayload = {
      nextId: 6,
      tickets: seedTickets,
    };
    localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));
  }
}

export function getGrievances(): GrievanceTicket[] {
  if (typeof window === "undefined") return [];
  seedGrievancesIfEmpty();
  try {
    const payload: GrievancePayload = JSON.parse(localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}");
    return payload.tickets || [];
  } catch {
    return [];
  }
}

export function getGrievanceById(id: string): GrievanceTicket | null {
  const tickets = getGrievances();
  return tickets.find((t) => t.id === id) || null;
}

export function addGrievance(input: NewGrievanceInput): GrievanceTicket {
  seedGrievancesIfEmpty();
  
  // Defensive validation on write
  if (!CATEGORY_OPTIONS.includes(input.category)) {
    throw new Error(`Invalid category submitted: ${input.category}`);
  }

  const payloadStr = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: GrievancePayload = { nextId: 1, tickets: [] };
  
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    // fallback
  }

  const now = new Date().toISOString();
  const currentYear = new Date().getFullYear();
  const sequentialIdStr = payload.nextId.toString().padStart(4, "0");
  const ticketId = `TKT-${currentYear}-${sequentialIdStr}`;
  
  const newTicket: GrievanceTicket = {
    ...input,
    id: ticketId,
    status: "Pending",
    department: "Central Municipal Administration",
    assignedOfficer: null,
    createdAt: now,
    updatedAt: now,
    adminNotes: [
      {
        status: "Pending",
        changedAt: now,
        changedByOfficerId: "system",
        note: "Ticket created",
      },
    ],
  };

  // Prepend to array
  payload.tickets.unshift(newTicket);
  payload.nextId += 1;

  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return newTicket;
}

export function updateGrievanceStatus(
  id: string,
  status: IssueStatus,
  note: string | undefined,
  changedByOfficerId: string
): GrievanceTicket | null {
  seedGrievancesIfEmpty();
  
  const payloadStr = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: GrievancePayload = { nextId: 1, tickets: [] };
  
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return null;
  }

  const idx = payload.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const ticket = payload.tickets[idx];
  const now = new Date().toISOString();

  // Update notes history
  ticket.adminNotes.push({
    status,
    changedAt: now,
    note,
    changedByOfficerId,
  });

  ticket.status = status;
  ticket.updatedAt = now;

  payload.tickets[idx] = ticket;
  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return ticket;
}

export function deleteGrievance(id: string): boolean {
  seedGrievancesIfEmpty();
  
  const payloadStr = localStorage.getItem(GRIEVANCE_STORE_KEY) || "{}";
  let payload: GrievancePayload = { nextId: 1, tickets: [] };
  
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return false;
  }

  const initialLen = payload.tickets.length;
  payload.tickets = payload.tickets.filter((t) => t.id !== id);
  
  if (payload.tickets.length === initialLen) {
    return false;
  }

  localStorage.setItem(GRIEVANCE_STORE_KEY, JSON.stringify(payload));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GRIEVANCE_SYNC_EVENT));
  }

  return true;
}

export function computeStats(tickets: GrievanceTicket[]): {
  total: number;
  critical: number;
  inProgress: number;
  resolved: number;
} {
  let criticalCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;

  tickets.forEach((t) => {
    if (t.priority === "Critical" && t.status !== "Resolved" && t.status !== "Rejected") {
      criticalCount += 1;
    }
    if (t.status === "In Progress") {
      inProgressCount += 1;
    }
    if (t.status === "Resolved") {
      resolvedCount += 1;
    }
  });

  return {
    total: tickets.length,
    critical: criticalCount,
    inProgress: inProgressCount,
    resolved: resolvedCount,
  };
}
