import { MunicipalDeptCode } from '../grievance';

// 1. AI Material & BOQ Estimation
export interface MaterialItemEstimate {
  materialName: string;
  quantity: number;
  unit: string; // e.g., "Tonnes", "Bags", "Meters", "Units"
  estimatedUnitCost: number;
  totalCost: number;
}

export interface BoqEstimate {
  ticketId: string;
  damageDimension: {
    lengthMeters: number;
    widthMeters: number;
    depthMeters?: number;
    areaSqMeters: number;
  };
  requiredMaterials: MaterialItemEstimate[];
  laborCostEstimate: number;
  equipmentCostEstimate: number;
  totalEstimatedBudget: number;
  isTenderThresholdExceeded: boolean; // Auto-flags if budget > ₹2,00,000
}

// 2. Civic Credit & Community Verification
export interface CivicCreditProfile {
  citizenId: string;
  totalCredits: number;
  tier: 'BRONZE_CITIZEN' | 'SILVER_GUARDIAN' | 'GOLD_CIVIC_LEADER';
  verifiedActionsCount: number;
  availableRebates: {
    propertyTaxRebatePercentage: number;
    waterBillDiscountInr: number;
    freeParkingHoursAvailable: number;
  };
}

export interface NearbyVerificationMission {
  id: string;
  ticketId: string;
  title: string;
  departmentCode: MunicipalDeptCode;
  latitude: number;
  longitude: number;
  wardId: string;
  resolvedAt: string;
  rewardCredits: number; // e.g., 25 Credits
  officerProofPhotoUrl: string;
  status: 'PENDING_COMMUNITY_AUDIT' | 'AUDITED_VALID' | 'AUDITED_INVALID';
}

// 3. Dynamic Emergency & Outage Broadcasting
export type BroadcastSeverity = 'ADVISORY' | 'WARNING' | 'EMERGENCY_ALERT';

export interface WardEmergencyBroadcast {
  id: string;
  targetWardIds: string[]; // e.g. ["BMC Ward 12", "BMC Ward 15"] or ["ALL_WARDS"]
  targetWards?: string[];
  severity: BroadcastSeverity;
  headline: string;
  body: string;
  emergencyDepartment: MunicipalDeptCode;
  emergencyHelpline: string;
  pumpDeploymentLocation?: string;
  activeFrom: string;
  expiresAt: string;
  isActive?: boolean;
}

export interface ScheduledUtilityOutage {
  id: string;
  wardId: string;
  utilityType: 'WATER_MAINTENANCE' | 'ELECTRICAL_SHUTDOWN' | 'DRAIN_DESILTING';
  startTime: string;
  endTime: string;
  affectedStreets: string[];
  helpline: string;
}

// 4. Public Contractor Performance & Quality Scorecard
export interface ContractorScorecard {
  contractorId: string;
  companyName: string;
  licenseClass: 'CLASS_SPECIAL' | 'CLASS_A' | 'CLASS_B';
  awardedTendersCount: number;
  onTimeCompletionRate: number; // Percentage (e.g., 94%)
  citizenQualityRating: number; // Out of 5.0 (e.g., 4.7)
  reopenDefectRate: number; // % of resolved jobs reopened within 6 months
  blacklistStatus: 'ACTIVE_CLEAN' | 'UNDER_PROBATION' | 'BLACKLISTED';
  completedProjects: {
    tenderRef: string;
    projectTitle: string;
    completedDate: string;
    warrantyValidTill: string;
    defectFlagCount: number;
  }[];
}

// 5. Automated Complaint-to-Tender Threshold Rollup
export interface AutoTenderCandidate {
  id: string;
  departmentCode: MunicipalDeptCode;
  wardId: string;
  streetName: string;
  recurringTicketIds: string[];
  totalMaintenanceSpentInr: number;
  thresholdTriggerReason: string;
  draftTenderTitle: string;
  suggestedTenderBudget: number;
  status: 'DRAFTED_BY_AI' | 'APPROVED_BY_COMMISSIONER' | 'PUBLISHED_AS_TENDER';
}
