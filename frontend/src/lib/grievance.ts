export type IssueCategory =
  | "Roads & Potholes" | "Sanitation & Waste" | "Water Supply"
  | "Streetlights & Electricity" | "Public Safety" | "Parks & Recreation" | "Other";

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";
export type IssueStatus = "Pending" | "Under Review" | "In Progress" | "Resolved" | "Rejected";
export const STATUS_ORDER: IssueStatus[] = ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"];
export const CATEGORY_OPTIONS: IssueCategory[] = [
  "Roads & Potholes", "Sanitation & Waste", "Water Supply",
  "Streetlights & Electricity", "Public Safety", "Parks & Recreation", "Other",
];

export interface StatusHistoryEntry {
  status: IssueStatus;
  changedAt: string;
  note?: string;
  changedByOfficerId: string;
}

export interface GrievanceTicket {
  id: string; // ALWAYS "TKT-{year}-{4-digit padded}" going forward
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  title: string;
  description: string;
  category: IssueCategory;   // MUST be one of CATEGORY_OPTIONS — no free-text, no legacy uppercase short codes
  priority: IssuePriority;
  status: IssueStatus;       // MUST be one of STATUS_ORDER
  location: string;
  landmark?: string;
  imageUrl?: string;
  audioRecordingUrl?: string;
  department: "Central Municipal Administration";
  assignedOfficer: string | null;
  createdAt: string;
  updatedAt: string;
  adminNotes: StatusHistoryEntry[];
}

export type NewGrievanceInput = Omit<
  GrievanceTicket,
  "id" | "createdAt" | "updatedAt" | "department" | "status" | "adminNotes" | "assignedOfficer"
>;
