export type IssueCategory =
  | "Roads & Potholes" | "Water Supply" | "Cleanliness"
  | "Street Lights" | "Public Safety" | "Parks & Recreation" | "Other";

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";
export type IssueStatus = "Pending" | "Under Review" | "In Progress" | "Resolved" | "Rejected";
export const STATUS_ORDER: IssueStatus[] = ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"];
export const CATEGORY_OPTIONS: IssueCategory[] = [
  "Roads & Potholes", "Water Supply", "Cleanliness",
  "Street Lights", "Public Safety", "Parks & Recreation", "Other",
];

// SLA response targets, used both for citizen-facing display and by CivicBot's FAQ answers
export const CATEGORY_SLA_HOURS: Record<IssueCategory, number> = {
  "Roads & Potholes": 48,
  "Water Supply": 24,
  "Cleanliness": 48,
  "Street Lights": 36,
  "Public Safety": 12,
  "Parks & Recreation": 72,
  "Other": 72,
};

export interface StatusHistoryEntry {
  status: IssueStatus;
  changedAt: string;
  note?: string;
  changedByOfficerId: string;
}

export interface GrievanceTicket {
  id: string;                 // "TKT-{year}-{4-digit padded}"
  citizenName: string;
  citizenEmail: string;       // used to scope "my tickets"/"my complaints" views
  citizenPhone?: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: string;
  landmark?: string;
  imageUrl?: string;
  upvotes: number;            // starts at 1 on creation
  department: "Central Municipal Administration";
  assignedOfficer: string | null;
  createdAt: string;
  updatedAt: string;
  adminNotes: StatusHistoryEntry[];
}

export type NewGrievanceInput = Omit<
  GrievanceTicket,
  "id" | "createdAt" | "updatedAt" | "department" | "status" | "adminNotes" | "assignedOfficer" | "upvotes"
>;

// Compact badge labels for tight UI spots — display-only, NEVER stored.
export function getCategoryShortLabel(category: IssueCategory): string {
  const map: Record<IssueCategory, string> = {
    "Roads & Potholes": "Roads",
    "Water Supply": "Water Supply",
    "Cleanliness": "Cleanliness",
    "Street Lights": "Street Lights",
    "Public Safety": "Public Safety",
    "Parks & Recreation": "Parks",
    "Other": "Other",
  };
  return map[category];
}
