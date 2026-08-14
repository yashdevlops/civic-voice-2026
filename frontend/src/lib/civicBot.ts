import {
  CATEGORY_SLA_HOURS,
  IssueCategory
} from "./grievance";
import { getGrievancesByCitizenEmail } from "./grievanceStore";

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
    return "For genuine emergencies, please call your local emergency services. For non-urgent municipal issues, our simulated helpline in this demo is 1800-XXX-XXXX.";
  }

  // 2. Status of Latest Ticket
  if (cleanMsg.includes("status") && (cleanMsg.includes("latest") || cleanMsg.includes("recent"))) {
    const list = getGrievancesByCitizenEmail(citizenEmail);
    if (list.length === 0) {
      return "You haven't filed any complaints yet. Head to Report an Issue to file your first one!";
    }
    // Sort by createdAt descending
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = sorted[0];
    const formattedDate = new Date(latest.createdAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `Your most recent ticket is ${latest.id} — "${latest.title}" — currently ${latest.status}. Filed on ${formattedDate}.`;
  }

  // 3. Show All Complaints
  if (cleanMsg.includes("complaints") || cleanMsg.includes("tickets") || cleanMsg.includes("my issues")) {
    const list = getGrievancesByCitizenEmail(citizenEmail);
    if (list.length === 0) {
      return "You haven't filed any complaints yet. Head to Report an Issue to file your first one!";
    }
    const lines = list.map((t) => `- ${t.id}: "${t.title}" (${t.status})`);
    return `Here are your registered complaints:\n\n${lines.join("\n")}`;
  }

  // 4. SLA Response Times
  if (cleanMsg.includes("sla") || cleanMsg.includes("response time") || cleanMsg.includes("how long")) {
    const lines = Object.entries(CATEGORY_SLA_HOURS).map(
      ([cat, hours]) => `- ${cat}: ${hours}h`
    );
    return `Typical response targets:\n\n${lines.join("\n")}`;
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
    let category: IssueCategory = "Other";
    if (cleanMsg.includes("water") || cleanMsg.includes("pipe")) {
      category = "Water Supply";
    } else if (cleanMsg.includes("pothole") || cleanMsg.includes("road")) {
      category = "Roads & Potholes";
    } else if (cleanMsg.includes("light")) {
      category = "Street Lights";
    } else if (cleanMsg.includes("garbage") || cleanMsg.includes("sanitation")) {
      category = "Cleanliness";
    }

    return `To report a ${category} issue, go to Report an Issue, select '${category}' as the category, add a location and description, and submit. You'll get a ticket ID instantly.`;
  }

  // 6. Greetings (Whole-word match)
  const isGreeting = /\b(hi|hello|hey)\b/i.test(cleanMsg);
  if (isGreeting) {
    return "Hello! I'm CivicBot, your civic assistant. I can check your ticket status, explain SLAs, or guide you through reporting an issue. What do you need?";
  }

  // 7. Fallback
  return "I'm not sure I understood that. Try asking about your ticket status, how to report an issue, or our response time SLAs — or tap one of the suggestions below.";
}
