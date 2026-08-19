import {
  MUNICIPAL_DEPARTMENTS,
  MunicipalDeptCode,
  GrievanceTicket,
} from "./grievance";
import { getGrievancesByCitizen } from "./grievanceStore";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export const QUICK_SUGGESTIONS: string[] = [
  "Check status of my latest ticket",
  "Show all my complaints",
  "How do I report a broken pipe?",
  "What is the emergency helpline?",
  "What are the SLA response times?",
];

export function generateBotResponse(userMessage: string, citizenEmail: string): string {
  const cleanMsg = userMessage.trim().toLowerCase();

  // 1. Emergency Helpline Check
  if (cleanMsg.includes("emergency") || cleanMsg.includes("helpline")) {
    return "For genuine emergencies, please call your local emergency services (112). For BMC municipal issues, the toll-free helpline is 1800-345-0083.";
  }

  // 2. Status of Latest Ticket
  if (cleanMsg.includes("status") && (cleanMsg.includes("latest") || cleanMsg.includes("recent"))) {
    const list = getGrievancesByCitizen(citizenEmail);
    if (list.length === 0) {
      return "You haven't filed any complaints yet. Head to Citizen Portal to report your first issue!";
    }
    // Sort by createdAt descending
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = sorted[0];
    const formattedDate = new Date(latest.createdAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `Your most recent ticket is ${latest.id} — "${latest.title}" — currently ${latest.status}. Logged on ${formattedDate}.`;
  }

  // 3. Show All Complaints
  if (cleanMsg.includes("complaints") || cleanMsg.includes("tickets") || cleanMsg.includes("my issues")) {
    const list = getGrievancesByCitizen(citizenEmail);
    if (list.length === 0) {
      return "You haven't filed any complaints yet. Head to Citizen Portal to file one!";
    }
    const lines = list.map((t: GrievanceTicket) => `- ${t.id}: "${t.title}" (${t.status})`);
    return `Here are your registered complaints:\n\n${lines.join("\n")}`;
  }

  // 4. SLA Response Times
  if (cleanMsg.includes("sla") || cleanMsg.includes("response time") || cleanMsg.includes("how long")) {
    const lines = Object.values(MUNICIPAL_DEPARTMENTS).map(
      (d) => `- ${d.name}: ${d.defaultSlaHours}h`
    );
    return `BMC Department SLA Response Targets:\n\n${lines.join("\n")}`;
  }

  // 5. How to Report X
  if (
    cleanMsg.includes("report") &&
    (cleanMsg.includes("pipe") ||
      cleanMsg.includes("water") ||
      cleanMsg.includes("pothole") ||
      cleanMsg.includes("road") ||
      cleanMsg.includes("light") ||
      cleanMsg.includes("garbage") ||
      cleanMsg.includes("sanitation"))
  ) {
    return `To report an issue, open the Citizen Portal, fill in the details (with auto-detected BMC ward), and submit. Your report will be routed to the respective BMC Department instantly.`;
  }

  // 6. Greetings
  const isGreeting = /\b(hi|hello|hey)\b/i.test(cleanMsg);
  if (isGreeting) {
    return "Hello! I'm CivicBot, your BMC civic assistant. I can check your ticket status, explain SLAs, or guide you through reporting an issue. What do you need?";
  }

  // 7. Fallback
  return "I'm not sure I understood that. Try asking about your ticket status, how to report an issue, or response time SLAs — or tap one of the quick suggestions below.";
}
