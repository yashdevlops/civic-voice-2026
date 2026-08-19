"use client";

export interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string; // ISO String
  read: boolean;
  category: 'OFFICIAL' | 'SYSTEM' | 'CONTRACT';
  actionUrl?: string;
}

export const MESSAGES_STORE_KEY = "civic_voice_messages_master_v1";
export const MESSAGES_SYNC_EVENT = "civic_voice_messages_sync_v1";

const INITIAL_MESSAGES: InboxMessage[] = [
  {
    id: "msg-101",
    sender: "BMC e-Procurement Directorate",
    subject: "Welcome to Bhubaneswar Municipal E-Procurement Cell",
    body: "Authorized contractors can browse active tenders, submit financial quotes, and receive physical entry tokens for on-site auction chambers.",
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    read: true,
    category: "CONTRACT",
    actionUrl: "/contracts",
  },
];

export function getMessages(): InboxMessage[] {
  if (typeof window === "undefined") return INITIAL_MESSAGES;
  try {
    const raw = localStorage.getItem(MESSAGES_STORE_KEY);
    if (!raw) {
      localStorage.setItem(MESSAGES_STORE_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
}

export function addMessage(entry: Omit<InboxMessage, "id" | "timestamp" | "read">): InboxMessage {
  const current = getMessages();
  const newMsg: InboxMessage = {
    ...entry,
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const updated = [newMsg, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(MESSAGES_STORE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(MESSAGES_SYNC_EVENT));
  }
  return newMsg;
}
