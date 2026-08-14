/**
 * offline-queue.ts — Honest offline submission queue for CivicVoice.
 *
 * When the backend is unreachable, complaints are queued here with a clearly
 * prefixed pending ID (#PENDING-...) so they are never confused with real
 * server-issued IDs. The queue auto-retries on reconnect and on load.
 *
 * Storage key: "civic_voice_pending_submissions"
 * This key is deliberately separate from confirmed tickets — never co-mingle
 * the two, since they have different shapes and rendering treatment.
 */

const QUEUE_KEY = "civic_voice_pending_submissions";
const MAX_ATTEMPTS = 5;
const MAX_QUEUE_SIZE = 10;

// ── Types ────────────────────────────────────────────────────────────────────

export interface SerializableLocation {
  source: "geolocation" | "manual";
  text: string;
  coordinates?: { lat: number; lng: number };
}

export interface PendingPayload {
  title: string;
  description: string;
  category: string;
  location: SerializableLocation;
  /** base64 data URL of the attached image, or null if not persisted */
  imageDataUrl: string | null;
  /** base64 data URL of the audio recording, or null if not persisted */
  audioDataUrl: string | null;
  /** Original filename hint for the image, for user messaging */
  imageFileName: string | null;
}

export interface PendingSubmission {
  localId: string;        // e.g. "#PENDING-A1B2C3"
  payload: PendingPayload;
  createdAt: string;      // ISO 8601
  status: "pending" | "retrying" | "failed";
  attempts: number;
  lastAttempt: string | null; // ISO 8601 or null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generates a short random uppercase alphanumeric suffix. */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Converts a File/Blob to a base64 data URL. Returns null on error. */
export async function fileToDataUrl(file: File | Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const MAX_BYTES = 3 * 1024 * 1024; // 3 MB cap for localStorage safety
    if (file.size > MAX_BYTES) {
      resolve(null); // too large to persist offline — caller must warn the user
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// ── Queue CRUD ────────────────────────────────────────────────────────────────

export function loadQueue(): PendingSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PendingSubmission[];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingSubmission[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("[offline-queue] Failed to persist queue:", e);
  }
}

export function enqueue(submission: PendingSubmission): void {
  const queue = loadQueue();
  // Warn (but don't crash) if queue is getting large
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.warn(
      `[offline-queue] Queue at capacity (${MAX_QUEUE_SIZE} items). Oldest entry will be removed to make space.`
    );
    queue.shift(); // remove oldest
  }
  queue.push(submission);
  saveQueue(queue);
}

export function removeFromQueue(localId: string): void {
  const queue = loadQueue().filter((item) => item.localId !== localId);
  saveQueue(queue);
}

export function updateQueueItem(localId: string, updates: Partial<PendingSubmission>): void {
  const queue = loadQueue().map((item) =>
    item.localId === localId ? { ...item, ...updates } : item
  );
  saveQueue(queue);
}

export function getQueueSize(): number {
  return loadQueue().length;
}

// ── Retry Logic ───────────────────────────────────────────────────────────────

type SyncCallback = (item: PendingSubmission) => Promise<{ realId: string }>;
type OnSyncSuccess = (localId: string, realId: string) => void;
type OnSyncError = (localId: string, attempts: number) => void;

let _retryIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Attempts to flush the pending queue by calling `syncCallback` for each item.
 * On success: removes from queue and fires `onSuccess`.
 * On failure: increments attempts, marks as "failed" after MAX_ATTEMPTS, fires `onError`.
 */
export async function flushQueue(
  syncCallback: SyncCallback,
  onSuccess: OnSyncSuccess,
  onError: OnSyncError
): Promise<void> {
  const queue = loadQueue();
  if (queue.length === 0) return;

  for (const item of queue) {
    if (item.status === "failed") continue; // awaiting manual retry

    updateQueueItem(item.localId, {
      status: "retrying",
      lastAttempt: new Date().toISOString(),
    });

    try {
      const { realId } = await syncCallback(item);
      removeFromQueue(item.localId);
      onSuccess(item.localId, realId);
    } catch (err: unknown) {
      const newAttempts = item.attempts + 1;
      const nextStatus = newAttempts >= MAX_ATTEMPTS ? "failed" : "pending";
      updateQueueItem(item.localId, {
        status: nextStatus,
        attempts: newAttempts,
        lastAttempt: new Date().toISOString(),
      });
      onError(item.localId, newAttempts);
      console.error(
        `[offline-queue] Sync failed for ${item.localId} (attempt ${newAttempts}/${MAX_ATTEMPTS}):`,
        err
      );
    }
  }
}

/**
 * Starts the background retry scheduler.
 * Retries the queue every `intervalMs` while pending items exist.
 * Automatically stops when the queue empties.
 */
export function startRetryScheduler(
  syncCallback: SyncCallback,
  onSuccess: OnSyncSuccess,
  onError: OnSyncError,
  intervalMs = 45_000
): void {
  if (_retryIntervalId !== null) return; // already running
  _retryIntervalId = setInterval(async () => {
    const size = getQueueSize();
    if (size === 0) {
      stopRetryScheduler();
      return;
    }
    await flushQueue(syncCallback, onSuccess, onError);
  }, intervalMs);
}

export function stopRetryScheduler(): void {
  if (_retryIntervalId !== null) {
    clearInterval(_retryIntervalId);
    _retryIntervalId = null;
  }
}

/** Registers a one-shot flush on the browser `online` event. */
export function registerOnlineListener(
  syncCallback: SyncCallback,
  onSuccess: OnSyncSuccess,
  onError: OnSyncError
): () => void {
  const handler = () => flushQueue(syncCallback, onSuccess, onError);
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}

export const MAX_QUEUE_CAP = MAX_QUEUE_SIZE;
export const MAX_RETRY_ATTEMPTS = MAX_ATTEMPTS;
