"use client";

export interface CivicNotification {
  id: string;
  type: "complaint_status" | "vote_counted" | "assembly" | "quarter_round";
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  timestamp: string; // ISO String
  iconType: "info" | "vote" | "leaf";
}

export const MASTER_NOTIF_STORE_KEY = "civic_voice_notifications_master_v1";
export const MASTER_NOTIF_SYNC_EVENT = "civic_voice_notifications_sync_v1";

const INITIAL_SEED_NOTIFICATIONS: CivicNotification[] = [
  {
    id: "cn-1001",
    type: "complaint_status",
    title: "Complaint Registered",
    message: "Your complaint #GRV-2026-0842 (Broken streetlight near Jayanagar Park) was successfully registered.",
    relatedId: "GRV-2026-0842",
    read: false,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    iconType: "info",
  },
  {
    id: "cn-1002",
    type: "vote_counted",
    title: "Vote Recorded",
    message: "Your vote for 'Ward 12 Solar Streetlight Installation' was counted in Participatory Budget.",
    relatedId: "prop-12",
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    iconType: "vote",
  },
  {
    id: "cn-1003",
    type: "assembly",
    title: "Ward Assembly Meeting",
    message: "Monthly Ward Committee Assembly starts tomorrow at 10:00 AM.",
    read: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    iconType: "leaf",
  },
  {
    id: "cn-1004",
    type: "complaint_status",
    title: "Grievance Resolved",
    message: "Your complaint #GRV-2026-0711 (Water pipe leak on 4th Main) status changed to RESOLVED.",
    relatedId: "GRV-2026-0711",
    read: true,
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    iconType: "info",
  },
  {
    id: "cn-1005",
    type: "quarter_round",
    title: "Budgeting Round Open",
    message: "New Participatory Budgeting voting round opened for Quarter 3.",
    read: true,
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    iconType: "vote",
  },
];

function dispatchSyncEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MASTER_NOTIF_SYNC_EVENT));
  }
}

export function getNotifications(): CivicNotification[] {
  if (typeof window === "undefined") return INITIAL_SEED_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(MASTER_NOTIF_STORE_KEY);
    if (!raw) {
      localStorage.setItem(MASTER_NOTIF_STORE_KEY, JSON.stringify(INITIAL_SEED_NOTIFICATIONS));
      return INITIAL_SEED_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_NOTIFICATIONS;
  } catch {
    return INITIAL_SEED_NOTIFICATIONS;
  }
}

export function getUnreadCount(): number {
  const notifs = getNotifications();
  return notifs.filter((n) => !n.read).length;
}

export function addNotification(
  entry: Omit<CivicNotification, "id" | "timestamp" | "read">
): CivicNotification {
  const current = getNotifications();
  const newNotif: CivicNotification = {
    ...entry,
    id: `cn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: false,
    timestamp: new Date().toISOString(),
  };

  const updated = [newNotif, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(MASTER_NOTIF_STORE_KEY, JSON.stringify(updated));
    dispatchSyncEvent();
  }
  return newNotif;
}

export function markAsRead(id: string): void {
  const notifs = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  if (typeof window !== "undefined") {
    localStorage.setItem(MASTER_NOTIF_STORE_KEY, JSON.stringify(notifs));
    dispatchSyncEvent();
  }
}

export function markAllAsRead(): void {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  if (typeof window !== "undefined") {
    localStorage.setItem(MASTER_NOTIF_STORE_KEY, JSON.stringify(notifs));
    dispatchSyncEvent();
  }
}

// Backwards compatibility aliases
export const getRelativeTimeString = (isoDate: string): string => {
  const diffSecs = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

export function notifyComplaintSubmitted(complaint: { id: string; title: string }) {
  return addNotification({
    type: "complaint_status",
    title: "Complaint Registered",
    message: `Your complaint #${complaint.id} (${complaint.title}) was successfully registered.`,
    relatedId: complaint.id,
    iconType: "info",
  });
}

export function notifyVoteCast(proposal: { id: string; title: string }) {
  return addNotification({
    type: "vote_counted",
    title: "Vote Recorded",
    message: `Your vote for '${proposal.title}' was counted in Participatory Budget.`,
    relatedId: proposal.id,
    iconType: "vote",
  });
}

export const markNotificationRead = markAsRead;
export const markAllNotificationsRead = markAllAsRead;
export const NOTIF_SYNC_EVENT = MASTER_NOTIF_SYNC_EVENT;
