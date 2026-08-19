import { MunicipalDeptCode } from './grievance';

export type TenderStatus =
  | 'OPEN_FOR_BIDDING'
  | 'TECHNICAL_EVALUATION'
  | 'ONSITE_AUCTION_SCHEDULED'
  | 'AWARDED'
  | 'CLOSED';

export type ContractorCategory =
  | 'CLASS_SPECIAL'
  | 'CLASS_A'
  | 'CLASS_B'
  | 'CLASS_C'
  | 'MSME_STARTUP';

export interface MunicipalTender {
  id: string; // e.g. "BMC/TND/2026/RD-089"
  title: string;
  departmentCode: MunicipalDeptCode;
  departmentName: string;
  referenceNumber: string;
  scopeOfWork: string;
  estimatedCost: number; // in INR (e.g. 8500000 = ₹85.00 Lakhs)
  earnestMoneyDeposit: number; // EMD in INR (e.g. 170000 = ₹1,70,000)
  tenderFee: number; // e.g. 10000
  contractDurationDays: number; // e.g. 120 Days
  eligibleContractorClass: ContractorCategory[];
  publishedDate: string; // ISO String
  bidSubmissionDeadline: string; // ISO String
  onsiteBiddingDateTime: string; // Exact date & time when on-site physical bidding starts
  biddingChamber: string; // e.g., "Executive Tender Chamber 1, 2nd Floor, BMC Head Office, Bhubaneswar"
  reportingGuidelines: string; // Physical verification rules and reporting time
  tenderDocumentPdfUrl?: string;
  totalBidsReceived: number;
  status: TenderStatus;
}

export interface ContractorBidApplication {
  id: string; // e.g. "BID-2026-9812"
  tenderId: string;
  tenderTitle: string;
  contractorName: string;
  companyName: string;
  companyGst: string;
  contractorLicenseClass: ContractorCategory;
  bidderEmail: string;
  bidderPhone: string;
  proposedBidAmount: number; // Bid quotation in INR
  completionTimelineDays: number;
  technicalProposalDocUrl?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';
  submittedAt: string;
  onsiteBiddingDetails: {
    scheduledDate: string;
    scheduledTime: string;
    biddingVenue: string;
    gateEntryToken: string; // e.g. "#BMC-PASS-8472"
    reportingInstruction: string;
  };
}
