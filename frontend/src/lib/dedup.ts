/**
 * dedup.ts — Client-side duplicate-detection utilities for CivicVoice.
 *
 * This module performs a scoped, multi-gate check that flags a new submission
 * as a likely duplicate of ONE OF THIS USER'S OWN previously-confirmed tickets.
 *
 * It does NOT cross-reference other citizens' reports — that responsibility
 * belongs to the server-side dedup (reflected in the `is_duplicate` field of
 * GrievanceCreateResponse). This client-side gate is purely a UX guard against
 * accidental re-submission by the same user.
 *
 * All four gates must pass simultaneously for a match to be flagged:
 *   1. Text similarity (Jaccard ≥ TEXT_SIMILARITY_THRESHOLD)
 *   2. Same category
 *   3. Location proximity (Haversine ≤ PROXIMITY_RADIUS_METERS, if coords exist)
 *      OR locality text substring match (weaker signal, requires text gate too)
 *   4. Existing ticket created within DEDUP_TIME_WINDOW_DAYS
 */

// ── Named constants (not magic numbers) ──────────────────────────────────────

/** Jaccard similarity score (0–1) above which two texts are "similar". */
export const TEXT_SIMILARITY_THRESHOLD = 0.55;

/** Maximum age of an existing ticket (in days) to be considered for dedup. */
export const DEDUP_TIME_WINDOW_DAYS = 30;

/** Max distance in metres between two GPS coordinates to be considered nearby. */
export const PROXIMITY_RADIUS_METERS = 200;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DedupCandidate {
  id: string;
  title: string;
  description: string;
  category: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  upvote_count: number;
  created_at: string; // ISO 8601
  status: string;
}

export interface DedupInput {
  title: string;
  description: string;
  category: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

// ── Text helpers ──────────────────────────────────────────────────────────────

/** Strip punctuation, collapse whitespace, lowercase. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token set from normalised text. */
function tokenSet(s: string): Set<string> {
  const tokens = normalizeText(s).split(" ").filter(Boolean);
  return new Set(tokens);
}

/**
 * Jaccard similarity between two text strings (based on token sets).
 * Returns a value between 0 (no overlap) and 1 (identical token sets).
 */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach((token) => { if (setB.has(token)) intersection++; });
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

// ── Location helpers ──────────────────────────────────────────────────────────

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Haversine distance between two GPS coordinates, in metres.
 */
export function haversineDistanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Checks if two free-text location strings share a likely locality.
 * Used as a WEAK fallback when GPS coordinates are unavailable.
 * This alone is insufficient — it requires the text-similarity gate to also pass.
 */
function localitySubstringMatch(addrA?: string | null, addrB?: string | null): boolean {
  if (!addrA || !addrB) return false;
  const a = normalizeText(addrA);
  const b = normalizeText(addrB);
  // Locality match: one address is a substring of the other, or they share ≥2 tokens
  if (a.includes(b) || b.includes(a)) return true;
  const tokA = tokenSet(addrA);
  const tokB = tokenSet(addrB);
  let shared = 0;
  tokA.forEach((t) => { if (tokB.has(t)) shared++; });
  return shared >= 2;
}

// ── Gate check ────────────────────────────────────────────────────────────────

function isWithinTimeWindow(createdAt: string): boolean {
  try {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays <= DEDUP_TIME_WINDOW_DAYS;
  } catch {
    return false;
  }
}

/**
 * Scans `existingTickets` for a likely duplicate of `newComplaint`.
 *
 * Returns the best-matching candidate if ALL four gates pass, otherwise null.
 * If multiple candidates pass all gates, the one with the highest Jaccard
 * score is returned.
 */
export function findDuplicateCandidate(
  newComplaint: DedupInput,
  existingTickets: DedupCandidate[]
): DedupCandidate | null {
  const newText = `${newComplaint.title} ${newComplaint.description}`;
  let bestMatch: DedupCandidate | null = null;
  let bestScore = -1;

  for (const existing of existingTickets) {
    // Gate 4 first (cheapest) — time window
    if (!isWithinTimeWindow(existing.created_at)) continue;

    // Gate 2 — same category (case-insensitive)
    const catA = (newComplaint.category || "").toUpperCase().trim();
    const catB = (existing.category || "").toUpperCase().trim();
    // Allow empty category on either side only as a soft pass (don't auto-reject)
    if (catA && catB && catA !== catB) continue;

    // Gate 1 — text similarity
    const existingText = `${existing.title} ${existing.description}`;
    const score = jaccardSimilarity(newText, existingText);
    if (score < TEXT_SIMILARITY_THRESHOLD) continue;

    // Gate 3 — location proximity
    const newHasCoords = newComplaint.latitude != null && newComplaint.longitude != null;
    const existHasCoords = existing.latitude != null && existing.longitude != null;

    let locationGatePasses = false;

    if (newHasCoords && existHasCoords) {
      // Both have GPS — use precise Haversine check
      const dist = haversineDistanceMeters(
        newComplaint.latitude!, newComplaint.longitude!,
        existing.latitude!, existing.longitude!
      );
      locationGatePasses = dist <= PROXIMITY_RADIUS_METERS;
    } else {
      // Fallback to looser locality text match (weaker — text gate has already passed)
      locationGatePasses = localitySubstringMatch(newComplaint.address, existing.address);
    }

    if (!locationGatePasses) continue;

    // All gates passed — track best score
    if (score > bestScore) {
      bestScore = score;
      bestMatch = existing;
    }
  }

  return bestMatch;
}
