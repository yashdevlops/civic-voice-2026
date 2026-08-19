import { MunicipalTender } from './contracts';

export const SEED_MUNICIPAL_TENDERS: MunicipalTender[] = [
  {
    id: 'BMC/TND/2026/RD-089',
    title: 'Widening, Bituminous Resurfacing & Storm Drain Integration of Patia-KIIT Arterial Road (Ward 15)',
    departmentCode: 'roads_potholes',
    departmentName: 'Roads & Civil Infrastructure',
    referenceNumber: 'BMC-CE-RD-2026-W15-089',
    scopeOfWork: 'Comprehensive 4-lane road widening with heavy-duty bituminous macadam, culvert construction, and precast concrete stormwater duct integration over a 3.4 km stretch.',
    estimatedCost: 8500000, // ₹85.00 Lakhs
    earnestMoneyDeposit: 170000, // ₹1.70 Lakhs
    tenderFee: 10000,
    contractDurationDays: 120,
    eligibleContractorClass: ['CLASS_SPECIAL', 'CLASS_A'],
    publishedDate: '2026-08-10T10:00:00Z',
    bidSubmissionDeadline: '2026-08-28T17:00:00Z',
    onsiteBiddingDateTime: '2026-08-30T11:30:00Z', // 30 Aug 2026, 11:30 AM IST
    biddingChamber: 'Tender Executive Chamber 1, 2nd Floor, BMC Head Office, Sahid Nagar, Bhubaneswar',
    reportingGuidelines: 'Physical attendance mandatory. Bring original contractor license, GST certificate, and EMD DD for verification 30 minutes prior to session.',
    totalBidsReceived: 4,
    status: 'OPEN_FOR_BIDDING'
  },
  {
    id: 'BMC/TND/2026/WS-042',
    title: 'Replacement of High-Pressure 600mm DI Potable Water Supply Trunk Line across Ward 9 & 12',
    departmentCode: 'water_supply',
    departmentName: 'Water Works & Sewerage Directorate',
    referenceNumber: 'BMC-WAT-DI-2026-042',
    scopeOfWork: 'Laying of 600mm K-9 Ductile Iron pipe with automatic pressure telemetry, air release valves, and automated scouring units for 24x7 municipal supply.',
    estimatedCost: 6200000, // ₹62.00 Lakhs
    earnestMoneyDeposit: 124000, // ₹1.24 Lakhs
    tenderFee: 10000,
    contractDurationDays: 90,
    eligibleContractorClass: ['CLASS_SPECIAL', 'CLASS_A', 'CLASS_B'],
    publishedDate: '2026-08-12T09:00:00Z',
    bidSubmissionDeadline: '2026-08-26T18:00:00Z',
    onsiteBiddingDateTime: '2026-08-29T14:00:00Z', // 29 Aug 2026, 02:00 PM IST
    biddingChamber: 'Conference Room B, Directorate of Public Health Engineering, Unit 2, Bhubaneswar',
    reportingGuidelines: 'Authorized company representative must carry power of attorney and physical quotation sealed copy.',
    totalBidsReceived: 6,
    status: 'OPEN_FOR_BIDDING'
  },
  {
    id: 'BMC/TND/2026/SL-114',
    title: 'Supply, Installation & 5-Year Smart Maintenance of 2,400 Energy-Efficient Smart LED Streetlights with CCMS',
    departmentCode: 'street_lights',
    departmentName: 'Electrical & Public Illumination',
    referenceNumber: 'BMC-ELE-LED-2026-114',
    scopeOfWork: 'Deployment of 45W & 90W smart dimmable LED fixtures with IoT-based Centralized Control and Monitoring System (CCMS) across North Zone Wards.',
    estimatedCost: 4200000, // ₹42.00 Lakhs
    earnestMoneyDeposit: 84000,
    tenderFee: 5000,
    contractDurationDays: 60,
    eligibleContractorClass: ['CLASS_A', 'CLASS_B', 'MSME_STARTUP'],
    publishedDate: '2026-08-15T11:00:00Z',
    bidSubmissionDeadline: '2026-08-27T16:00:00Z',
    onsiteBiddingDateTime: '2026-08-31T10:00:00Z', // 31 Aug 2026, 10:00 AM IST
    biddingChamber: 'Electrical Division Boardroom, BMC Central Depot, Rasulgarh, Bhubaneswar',
    reportingGuidelines: 'Physical sample fixture inspection scheduled immediately prior to financial envelope opening.',
    totalBidsReceived: 3,
    status: 'OPEN_FOR_BIDDING'
  },
  {
    id: 'BMC/TND/2026/CL-057',
    title: 'Automated Secondary Waste Segregation & Mechanized Bio-Mining Operation at Bhuasuni Waste Depot',
    departmentCode: 'cleanliness',
    departmentName: 'Solid Waste Management',
    referenceNumber: 'BMC-SWM-BIO-2026-057',
    scopeOfWork: 'Operation and maintenance of 300 TPD rotary trommel sieving machines, RDF extraction, and organic compost enrichment for legacy waste remediation.',
    estimatedCost: 11500000, // ₹1.15 Crores
    earnestMoneyDeposit: 230000,
    tenderFee: 15000,
    contractDurationDays: 365,
    eligibleContractorClass: ['CLASS_SPECIAL', 'CLASS_A'],
    publishedDate: '2026-08-05T12:00:00Z',
    bidSubmissionDeadline: '2026-08-25T17:00:00Z',
    onsiteBiddingDateTime: '2026-08-28T15:30:00Z', // 28 Aug 2026, 03:30 PM IST
    biddingChamber: 'Chief Sanitary Directorate, BMC Annex Building, Old Town, Bhubaneswar',
    reportingGuidelines: 'Entry permitted strictly upon presenting the generated physical Token Gate Pass.',
    totalBidsReceived: 5,
    status: 'OPEN_FOR_BIDDING'
  }
];
