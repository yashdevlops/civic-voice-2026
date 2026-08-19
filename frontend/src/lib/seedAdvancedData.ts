import {
  CivicCreditProfile,
  NearbyVerificationMission,
  WardEmergencyBroadcast,
  ScheduledUtilityOutage,
  ContractorScorecard,
  AutoTenderCandidate,
} from './types/advancedFeatures';

export const INITIAL_CIVIC_CREDIT_PROFILE: CivicCreditProfile = {
  citizenId: 'cit-current-user',
  totalCredits: 175,
  tier: 'SILVER_GUARDIAN',
  verifiedActionsCount: 7,
  availableRebates: {
    propertyTaxRebatePercentage: 5,
    waterBillDiscountInr: 100,
    freeParkingHoursAvailable: 20,
  },
};

export const INITIAL_VERIFICATION_MISSIONS: NearbyVerificationMission[] = [
  {
    id: 'VER-2026-001',
    ticketId: 'BMC-SL-2026-88',
    title: 'Khandagiri Square LED Luminaire Replacement Audit',
    departmentCode: 'street_lights',
    latitude: 20.254,
    longitude: 85.783,
    wardId: 'BMC Ward 12',
    resolvedAt: '2026-08-19T16:00:00Z',
    rewardCredits: 25,
    officerProofPhotoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    status: 'PENDING_COMMUNITY_AUDIT',
  },
  {
    id: 'VER-2026-002',
    ticketId: 'BMC-CL-2026-44',
    title: 'Patia Market Deep Sanitation & Garbage Clearance Audit',
    departmentCode: 'cleanliness',
    latitude: 20.354,
    longitude: 85.818,
    wardId: 'BMC Ward 15',
    resolvedAt: '2026-08-19T18:30:00Z',
    rewardCredits: 30,
    officerProofPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    status: 'PENDING_COMMUNITY_AUDIT',
  },
];

export const INITIAL_EMERGENCY_BROADCASTS: WardEmergencyBroadcast[] = [
  {
    id: 'EMG-2026-01',
    isActive: true,
    targetWardIds: ['BMC Ward 3', 'BMC Ward 7', 'BMC Ward 11', 'BMC Ward 15'],
    targetWards: ['BMC Ward 3', 'BMC Ward 7', 'BMC Ward 11', 'BMC Ward 15'],
    severity: 'EMERGENCY_ALERT',
    headline: 'Heavy Monsoon Inundation & Storm Drain Overflow Warning',
    body: 'High waterlogging reported across Patia & Cuttack Road corridors. 6 Mobile Dewatering Pumps deployed.',
    emergencyDepartment: 'public_safety',
    emergencyHelpline: '1800-345-0033',
    pumpDeploymentLocation: 'Patia Canal Outfall & Rasulgarh Junction',
    activeFrom: '2026-08-19T08:00:00Z',
    expiresAt: '2026-08-28T23:59:59Z',
  },
  {
    id: 'EMG-2026-02',
    isActive: false,
    targetWardIds: ['BMC Ward 9', 'BMC Ward 12'],
    targetWards: ['BMC Ward 9', 'BMC Ward 12'],
    severity: 'WARNING',
    headline: 'SCHEDULED WATER MAINLINE TRUNK SHUTDOWN',
    body: 'High-pressure 600mm DI water pipeline interconnection works ongoing. Water supply paused from 8:00 AM to 2:00 PM IST.',
    emergencyDepartment: 'water_supply',
    emergencyHelpline: '+91 94370 22001',
    activeFrom: '2026-08-20T08:00:00Z',
    expiresAt: '2026-08-20T14:00:00Z',
  },
];

export const INITIAL_SCHEDULED_OUTAGES: ScheduledUtilityOutage[] = [
  {
    id: 'OUT-2026-101',
    wardId: 'BMC Ward 12',
    utilityType: 'WATER_MAINTENANCE',
    startTime: 'Thursday, 08:00 AM IST',
    endTime: 'Thursday, 12:00 PM IST',
    affectedStreets: ['Khandagiri Main Road', 'Jayamarg Lane 3', 'Gautam Nagar'],
    helpline: '+91 94370 22001',
  },
  {
    id: 'OUT-2026-102',
    wardId: 'BMC Ward 15',
    utilityType: 'ELECTRICAL_SHUTDOWN',
    startTime: 'Friday, 02:00 PM IST',
    endTime: 'Friday, 05:00 PM IST',
    affectedStreets: ['KIIT Campus Road', 'Patia Station Square'],
    helpline: '+91 94370 42001',
  },
];

export const INITIAL_CONTRACTOR_SCORECARDS: ContractorScorecard[] = [
  {
    contractorId: 'CTR-KALINGA-01',
    companyName: 'M/s Kalinga Civil Infrastructures Pvt Ltd',
    licenseClass: 'CLASS_SPECIAL',
    awardedTendersCount: 14,
    onTimeCompletionRate: 94,
    citizenQualityRating: 4.7,
    reopenDefectRate: 3.2,
    blacklistStatus: 'ACTIVE_CLEAN',
    completedProjects: [
      {
        tenderRef: 'BMC-CE-RD-2025-012',
        projectTitle: 'Sahid Nagar 4-Lane Bituminous Overlay',
        completedDate: '2025-11-15',
        warrantyValidTill: '2026-11-15',
        defectFlagCount: 1,
      },
      {
        tenderRef: 'BMC-CE-RD-2025-089',
        projectTitle: 'Janpath Pedestrian Paver Realignment',
        completedDate: '2026-02-10',
        warrantyValidTill: '2027-02-10',
        defectFlagCount: 0,
      },
    ],
  },
  {
    contractorId: 'CTR-UTKAL-02',
    companyName: 'M/s Utkal Electricals & Smart Lighting Ltd',
    licenseClass: 'CLASS_A',
    awardedTendersCount: 9,
    onTimeCompletionRate: 89,
    citizenQualityRating: 4.4,
    reopenDefectRate: 4.8,
    blacklistStatus: 'ACTIVE_CLEAN',
    completedProjects: [
      {
        tenderRef: 'BMC-ELE-LED-2025-104',
        projectTitle: 'Rasulgarh High-Mast Lighting Installation',
        completedDate: '2025-09-20',
        warrantyValidTill: '2028-09-20',
        defectFlagCount: 2,
      },
    ],
  },
  {
    contractorId: 'CTR-DEFUNCT-03',
    companyName: 'M/s Defunct Infra & Heavy Drainage Ltd',
    licenseClass: 'CLASS_B',
    awardedTendersCount: 4,
    onTimeCompletionRate: 52,
    citizenQualityRating: 2.1,
    reopenDefectRate: 24.5,
    blacklistStatus: 'UNDER_PROBATION',
    completedProjects: [
      {
        tenderRef: 'BMC-WAT-DRN-2025-033',
        projectTitle: 'Cuttack Road Open Drain Masonry',
        completedDate: '2025-08-01',
        warrantyValidTill: '2026-08-01',
        defectFlagCount: 7,
      },
    ],
  },
];

export const INITIAL_AUTO_TENDER_CANDIDATES: AutoTenderCandidate[] = [
  {
    id: 'ATC-2026-089',
    departmentCode: 'roads_potholes',
    wardId: 'BMC Ward 15',
    streetName: 'Patia-KIIT Arterial Stretch',
    recurringTicketIds: ['GRV-2026-101', 'GRV-2026-108', 'GRV-2026-114', 'GRV-2026-120', 'GRV-2026-135', 'GRV-2026-142'],
    totalMaintenanceSpentInr: 184000,
    thresholdTriggerReason: '6 Repeat Pothole Repairs in 30 Days (Cumulative Spend > ₹1,50,000)',
    draftTenderTitle: 'Widening, Bituminous Resurfacing & Storm Drain Integration of Patia-KIIT Arterial Road (Ward 15)',
    suggestedTenderBudget: 4500000, // ₹45.00 Lakhs
    status: 'DRAFTED_BY_AI',
  },
];
