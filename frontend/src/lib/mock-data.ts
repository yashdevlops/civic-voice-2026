/**
 * mock-data.ts — Seed fixtures for all CivicVoice dashboard pages.
 *
 * City: Bhubaneswar, Odisha (BMC — Bhubaneswar Municipal Corporation)
 * All location data is from Bhubaneswar BMC wards.
 *
 * Replace individual arrays with real API calls when the backend is ready.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type ComplaintStatus = "In Progress" | "Pending" | "Resolved";
export type WorkStatus = "In Progress" | "Planned" | "Proposed" | "Completed";
export type ProposalStatus = "Active" | "Past" | "Fully Funded";

export interface MockComplaint {
  id: string;
  title: string;
  location: string;
  category: string;
  status: ComplaintStatus;
  date: string;
  thumbnailColor: string;
  upvote_count: number;
  created_at: string;     // ISO 8601
}

export interface MockPublicWork {
  id: string;
  title: string;
  location: string;
  votes: string;
  estimatedCost: string;
  status: WorkStatus;
  completionPct: number;
  isTopPriority?: boolean;
}

export interface MockBudgetProposal {
  id: string;
  title: string;
  estimatedCost: string;
  votes: string;
  numericVotes: number;
  targetVotes: number;
  supportPct: number;
  status: ProposalStatus;
}

export interface MockMessage {
  id: string;
  department: string;
  departmentInitial: string;
  departmentColor: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

export interface MockChatMessage {
  id: string;
  direction: "incoming" | "outgoing";
  text: string;
  time: string;
}

export interface MockNotification {
  id: string;
  type: "update" | "vote" | "reminder" | "info";
  text: string;
  timestamp: string;
  linkTo?: string;
}

export interface MockAreaData {
  area: string;
  count: number;
}

// ── Dashboard KPIs ──────────────────────────────────────────────────────────

export const MOCK_KPIS = [
  { label: "Total Complaints", value: "1,248", trend: "+12.5%", trendUp: true, from: "from last month" },
  { label: "In Progress",      value: "342",   trend: "+8.3%",  trendUp: true, from: "from last month" },
  { label: "Resolved",         value: "892",   trend: "+18.7%", trendUp: true, from: "from last month" },
  { label: "Pending",          value: "56",    trend: "-3.2%",  trendUp: false, from: "from last month" },
];

// ── Complaints Overview Chart Data ──────────────────────────────────────────

export const MOCK_COMPLAINTS_CHART = [
  { date: "1 May",  received: 280, resolved: 210 },
  { date: "8 May",  received: 420, resolved: 310 },
  { date: "15 May", received: 380, resolved: 350 },
  { date: "22 May", received: 560, resolved: 430 },
  { date: "31 May", received: 490, resolved: 460 },
];

// ── Top Issue Categories (Donut) ────────────────────────────────────────────

export const MOCK_CATEGORIES_DONUT = [
  { name: "Roads",         value: 38, color: "#F59E0B" },
  { name: "Water Supply",  value: 22, color: "#3B82F6" },
  { name: "Cleanliness",   value: 16, color: "#10B981" },
  { name: "Street Lights", value: 12, color: "#8B5CF6" },
  { name: "Waste Mgmt",    value:  8, color: "#6B7280" },
  { name: "Others",        value:  4, color: "#CBD5E1" },
];

// ── My Complaints ────────────────────────────────────────────────────────────

export const MOCK_COMPLAINTS: MockComplaint[] = [
  {
    id: "#CV12487",
    title: "Large pothole on Cuttack Road",
    location: "Cuttack Road, Satya Nagar, Bhubaneswar",
    category: "Roads",
    status: "In Progress",
    date: "31 May 2025",
    thumbnailColor: "#FEF3C7",
    upvote_count: 7,
    created_at: "2025-05-31T08:15:00.000Z",
  },
  {
    id: "#CV12476",
    title: "Water leakage for 3 days",
    location: "Nayapalli, Bhubaneswar",
    category: "Water Supply",
    status: "Pending",
    date: "30 May 2025",
    thumbnailColor: "#DBEAFE",
    upvote_count: 4,
    created_at: "2025-05-30T10:22:00.000Z",
  },
  {
    id: "#CV12465",
    title: "Garbage not collected",
    location: "Laxmi Sagar, Bhubaneswar",
    category: "Cleanliness",
    status: "In Progress",
    date: "30 May 2025",
    thumbnailColor: "#DCFCE7",
    upvote_count: 3,
    created_at: "2025-05-30T07:45:00.000Z",
  },
  {
    id: "#CV12453",
    title: "Street light not working",
    location: "Saheed Nagar, Bhubaneswar",
    category: "Street Lights",
    status: "Resolved",
    date: "29 May 2025",
    thumbnailColor: "#F3E8FF",
    upvote_count: 2,
    created_at: "2025-05-29T14:00:00.000Z",
  },
  {
    id: "#CV12431",
    title: "Overflowing drain on Janpath",
    location: "Janpath, Nayapalli, Bhubaneswar",
    category: "Cleanliness",
    status: "Resolved",
    date: "28 May 2025",
    thumbnailColor: "#DCFCE7",
    upvote_count: 5,
    created_at: "2025-05-28T09:30:00.000Z",
  },
];

// ── Analytics ────────────────────────────────────────────────────────────────

export const MOCK_ANALYTICS_KPIS = [
  { label: "Total Complaints",     value: "1,248",   trend: "↑12.5%",   trendUp: true  },
  { label: "Avg. Resolution Time", value: "4.2 Days", trend: "↓0.6 Days",trendUp: true  },
  { label: "SLA Compliance",       value: "92%",      trend: "↑5.3%",   trendUp: true  },
  { label: "Public Satisfaction",  value: "4.6 / 5",  trend: "↑0.3",    trendUp: true  },
];

export const MOCK_COMPLAINTS_TREND = [
  { date: "1 May",  total: 280 },
  { date: "8 May",  total: 420 },
  { date: "15 May", total: 380 },
  { date: "22 May", total: 560 },
  { date: "31 May", total: 490 },
];

export const MOCK_AREAS: MockAreaData[] = [
  { area: "Saheed Nagar",        count: 312 },
  { area: "Chandrasekharpur",    count: 256 },
  { area: "Nayapalli",           count: 198 },
  { area: "Old Town",            count: 142 },
  { area: "Patia",               count:  98 },
];

// ── Public Works ─────────────────────────────────────────────────────────────

export const MOCK_PUBLIC_WORKS: MockPublicWork[] = [
  {
    id: "pw-1",
    title: "Repair of Pothole-Prone Roads in Saheed Nagar",
    location: "Saheed Nagar, Bhubaneswar",
    votes: "2.1K",
    estimatedCost: "₹32.5 Lakhs",
    status: "In Progress",
    completionPct: 65,
    isTopPriority: true,
  },
  {
    id: "pw-2",
    title: "Drainage Improvement in Nayapalli",
    location: "Nayapalli, Bhubaneswar",
    votes: "1.6K",
    estimatedCost: "₹28.7 Lakhs",
    status: "Planned",
    completionPct: 30,
  },
  {
    id: "pw-3",
    title: "Street Light Installation in Old Town",
    location: "Old Town, Bhubaneswar",
    votes: "1.2K",
    estimatedCost: "₹18.9 Lakhs",
    status: "Proposed",
    completionPct: 10,
  },
];

// ── Budget Proposals ──────────────────────────────────────────────────────────

export const MOCK_BUDGET_PROPOSALS: MockBudgetProposal[] = [
  { id: "bp-1", title: "Road Repair — Saheed Nagar Zone",     estimatedCost: "₹32.5 Lakhs", votes: "2.1K", numericVotes: 2100, targetVotes: 2838, supportPct: 74, status: "Active" },
  { id: "bp-2", title: "Drainage Improvement — Nayapalli",    estimatedCost: "₹28.7 Lakhs", votes: "1.6K", numericVotes: 1600, targetVotes: 2540, supportPct: 63, status: "Active" },
  { id: "bp-3", title: "Street Lights — Old Town Lanes",      estimatedCost: "₹18.9 Lakhs", votes: "1.2K", numericVotes: 1200, targetVotes: 2308, supportPct: 52, status: "Active" },
  { id: "bp-4", title: "Waste Segregation Awareness Drive",   estimatedCost: "₹12.4 Lakhs", votes: "980",  numericVotes:  980, targetVotes: 2390, supportPct: 41, status: "Active" },
  { id: "bp-5", title: "Water Supply Pipeline — Patia Zone",  estimatedCost: "₹45.0 Lakhs", votes: "870",  numericVotes:  870, targetVotes: 2289, supportPct: 38, status: "Past"   },
];

// ── Messages ──────────────────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: MockMessage[] = [
  {
    id: "conv-1",
    department: "BMC Roads & Bridges",
    departmentInitial: "RB",
    departmentColor: "#F59E0B",
    lastMessage: "Our team has been assigned and repair work will start within 2 days.",
    timestamp: "10:31 AM",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    department: "BMC Water Supply & Sewerage",
    departmentInitial: "WS",
    departmentColor: "#3B82F6",
    lastMessage: "Your complaint has been forwarded to our field team.",
    timestamp: "Yesterday",
  },
  {
    id: "conv-3",
    department: "BMC Solid Waste Management",
    departmentInitial: "SW",
    departmentColor: "#10B981",
    lastMessage: "The sanitation drive has been scheduled for your area.",
    timestamp: "2 Jun",
  },
  {
    id: "conv-4",
    department: "BMC Electrical & Street Lights",
    departmentInitial: "EL",
    departmentColor: "#8B5CF6",
    lastMessage: "Maintenance crew will arrive within 48 hours.",
    timestamp: "1 Jun",
  },
  {
    id: "conv-5",
    department: "BMC Parks & Horticulture",
    departmentInitial: "PH",
    departmentColor: "#6B7280",
    lastMessage: "Inspection of the broken equipment has been completed.",
    timestamp: "30 May",
  },
];

export const MOCK_CHAT_THREAD: MockChatMessage[] = [
  {
    id: "msg-1",
    direction: "incoming",
    text: "Your complaint #CV12487 has been updated to In Progress.",
    time: "10:30 AM",
  },
  {
    id: "msg-2",
    direction: "incoming",
    text: "Our Roads team has been assigned and the repair work will start within 2 days.",
    time: "10:31 AM",
  },
  {
    id: "msg-3",
    direction: "outgoing",
    text: "Thank you for the quick update!",
    time: "10:32 AM",
  },
];

// ── Notifications ─────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif-1",
    type: "update",
    text: "Your complaint #CV12487 has been updated to In Progress.",
    timestamp: "10:30 AM",
    linkTo: "/dashboard/complaints",
  },
  {
    id: "notif-2",
    type: "info",
    text: "New update on complaint #CV12476.",
    timestamp: "Yesterday",
    linkTo: "/dashboard/complaints",
  },
  {
    id: "notif-3",
    type: "vote",
    text: "Your vote on 'Drainage Improvement in Nayapalli' has been recorded.",
    timestamp: "2 Jun",
    linkTo: "/dashboard/budget-proposals",
  },
  {
    id: "notif-4",
    type: "info",
    text: "Public works proposal 'Street Light Installation in Old Town' is now open for voting!",
    timestamp: "1 Jun",
    linkTo: "/dashboard/public-works",
  },
  {
    id: "notif-5",
    type: "reminder",
    text: "Reminder: Help keep Bhubaneswar clean. Report issues around you.",
    timestamp: "31 May",
    linkTo: "/citizen",
  },
];
