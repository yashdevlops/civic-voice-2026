/**
 * user-tickets.ts — Persistent storage for this user's confirmed (server-synced) tickets.
 *
 * Storage key: "civic_voice_user_tickets"
 *
 * This is distinct from:
 *   - "civic_voice_pending_submissions" (offline queue, not yet synced)
 *   - The mock/seed data (everyone else's / demo fallback tickets)
 *
 * Tickets here are fully confirmed by the server (they have real server IDs).
 */

const USER_TICKETS_KEY = "civic_voice_user_tickets";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Shape of a locally-stored confirmed user ticket.
 * Fields are a subset of GrievancePublic, plus any fields needed for dedup.
 */
export interface LocalTicket {
  id: string;            // Server-issued ID (e.g. a UUID)
  title: string;
  description: string;
  category: string;
  status: string;        // "OPEN" | "IN_PROGRESS" | "RESOLVED" | etc.
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  upvote_count: number;
  created_at: string;    // ISO 8601 — stamped at creation time, never mutated
  updated_at: string;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function loadUserTickets(): LocalTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_TICKETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalTicket[]) : [];
  } catch {
    return [];
  }
}

function saveAll(tickets: LocalTicket[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error("[user-tickets] Failed to persist tickets:", e);
  }
}

/**
 * Add or update a ticket. If a ticket with the same ID already exists,
 * it is replaced (used to sync status updates from the server).
 */
export function saveUserTicket(ticket: LocalTicket): void {
  const existing = loadUserTickets();
  const idx = existing.findIndex((t) => t.id === ticket.id);
  if (idx !== -1) {
    existing[idx] = ticket;
  } else {
    existing.unshift(ticket); // newest first
  }
  saveAll(existing);
}

/**
 * Increment the upvote_count of a ticket by 1 (called when user confirms "same issue").
 * Returns the updated ticket, or null if not found.
 */
export function upvoteUserTicket(id: string): LocalTicket | null {
  const tickets = loadUserTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], upvote_count: tickets[idx].upvote_count + 1 };
  saveAll(tickets);
  return tickets[idx];
}

/** Remove a ticket by ID (rarely needed, but kept for completeness). */
export function removeUserTicket(id: string): void {
  const tickets = loadUserTickets().filter((t) => t.id !== id);
  saveAll(tickets);
}

/**
 * Build a LocalTicket from a server GrievancePublic response.
 * Call this after a successful `submitGrievance()` response.
 */
export function ticketFromServerResponse(res: {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  upvote_count?: number;
  created_at?: string;
  updated_at?: string;
}): LocalTicket {
  return {
    id: res.id,
    title: res.title ?? "",
    description: res.description ?? "",
    category: res.category ?? "",
    status: res.status ?? "OPEN",
    address: res.address ?? null,
    latitude: res.latitude ?? null,
    longitude: res.longitude ?? null,
    upvote_count: res.upvote_count ?? 1,
    created_at: res.created_at ?? new Date().toISOString(),
    updated_at: res.updated_at ?? new Date().toISOString(),
  };
}
