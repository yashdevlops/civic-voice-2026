// ── Municipal Departments & Data Schema ───────────────────────────────────────

export type MunicipalDeptCode =
  | 'roads_potholes'
  | 'water_supply'
  | 'cleanliness'
  | 'street_lights'
  | 'public_safety'
  | 'parks_recreation';

export interface MunicipalDepartment {
  code: MunicipalDeptCode;
  name: string;
  icon: string;
  description: string;
  defaultSlaHours: number;
}

export const MUNICIPAL_DEPARTMENTS: Record<MunicipalDeptCode, MunicipalDepartment> = {
  roads_potholes: {
    code: 'roads_potholes',
    name: 'Roads & Potholes (Engineering)',
    icon: '🕳️',
    description: 'Road repairs, potholes, bridges, and footpaths',
    defaultSlaHours: 72,
  },
  water_supply: {
    code: 'water_supply',
    name: 'Water Supply & Sewerage',
    icon: '💧',
    description: 'Pipeline leaks, contaminated water, and drainage overflow',
    defaultSlaHours: 48,
  },
  cleanliness: {
    code: 'cleanliness',
    name: 'Cleanliness & Solid Waste',
    icon: '🗑️',
    description: 'Garbage accumulation, dump yard clearance, and sanitization',
    defaultSlaHours: 24,
  },
  street_lights: {
    code: 'street_lights',
    name: 'Street Lights & Electrical',
    icon: '💡',
    description: 'Broken streetlights, faulty poles, and power hazards',
    defaultSlaHours: 36,
  },
  public_safety: {
    code: 'public_safety',
    name: 'Public Safety & Enforcement',
    icon: '🚨',
    description: 'Illegal encroachment, stray animals, and public hazards',
    defaultSlaHours: 24,
  },
  parks_recreation: {
    code: 'parks_recreation',
    name: 'Parks & Recreation',
    icon: '🌲',
    description: 'Public parks, fallen trees, and municipal grounds',
    defaultSlaHours: 96,
  },
};

// 5-Stage Operational Pipeline + Lifecycle
export type ComplaintStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'OVERDUE'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GrievanceTicket {
  id: string; // Format: TKT-2026-XXXX
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  title: string;
  description: string;
  mediaUrls: string[];

  // Location & Ward
  latitude: number;
  longitude: number;
  addressText: string;
  landmark?: string;
  wardId: string; // e.g. "BMC Ward 12"
  wardNumber: number; // e.g. 12

  // Routing & Assignment
  departmentCode: MunicipalDeptCode;
  assignedOfficerName?: string;
  assignedOfficerRole?: string; // e.g., "Junior Engineer (JE)", "Sanitary Inspector"

  // Lifecycle & SLA
  status: ComplaintStatus;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  slaDeadlineAt: string; // ISO Timestamp

  // Proof of Work & Verification
  resolutionProof?: {
    photoUrl: string;
    remarks: string;
    resolvedAt: string;
    officerName: string;
  };
  citizenVerification?: 'pending' | 'confirmed' | 'reopened';
  reopenReason?: string;
  reopenedCount: number;

  // Community Upvoting / Duplicates
  supporterIds: string[];
  upvoteCount: number;
}

export interface DistrictClusterAlert {
  id: string;
  departmentCode: MunicipalDeptCode;
  departmentName: string;
  categoryLabel: string;
  affectedWards: string[];
  unresolvedCount: number;
  citizensAffected: number;
  summary: string;
  createdAt: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

// Compatibility alias for legacy category queries
export type IssueCategory =
  | "Roads & Potholes"
  | "Water Supply"
  | "Cleanliness"
  | "Street Lights"
  | "Public Safety"
  | "Parks & Recreation"
  | "Other";

export type IssuePriority = PriorityLevel;
export type IssueStatus = ComplaintStatus;

export const CATEGORY_OPTIONS: IssueCategory[] = [
  "Roads & Potholes",
  "Water Supply",
  "Cleanliness",
  "Street Lights",
  "Public Safety",
  "Parks & Recreation",
  "Other",
];

export const CATEGORY_TO_DEPT_CODE: Record<IssueCategory, MunicipalDeptCode> = {
  "Roads & Potholes": "roads_potholes",
  "Water Supply": "water_supply",
  "Cleanliness": "cleanliness",
  "Street Lights": "street_lights",
  "Public Safety": "public_safety",
  "Parks & Recreation": "parks_recreation",
  "Other": "cleanliness",
};

export const DEPT_CODE_TO_CATEGORY: Record<MunicipalDeptCode, IssueCategory> = {
  roads_potholes: "Roads & Potholes",
  water_supply: "Water Supply",
  cleanliness: "Cleanliness",
  street_lights: "Street Lights",
  public_safety: "Public Safety",
  parks_recreation: "Parks & Recreation",
};

export function getCategoryIcon(cat: IssueCategory | MunicipalDeptCode): string {
  if (cat in MUNICIPAL_DEPARTMENTS) {
    return MUNICIPAL_DEPARTMENTS[cat as MunicipalDeptCode].icon;
  }
  const code = CATEGORY_TO_DEPT_CODE[cat as IssueCategory];
  return MUNICIPAL_DEPARTMENTS[code]?.icon || "📋";
}

export function getCategoryShortLabel(cat: IssueCategory | MunicipalDeptCode): string {
  if (cat in MUNICIPAL_DEPARTMENTS) {
    return MUNICIPAL_DEPARTMENTS[cat as MunicipalDeptCode].name.split(" ")[0];
  }
  return String(cat).split(" ")[0];
}
