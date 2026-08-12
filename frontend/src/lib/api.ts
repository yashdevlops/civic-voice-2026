/**
 * api.ts — Axios instance + typed endpoint wrappers.
 *
 * Components NEVER call axios directly — all HTTP is routed through this file.
 * This ensures a single place to update base URLs, auth headers, or add
 * request/response interceptors (e.g. error logging, token refresh).
 */

import axios, { AxiosResponse } from "axios";

// ── Types (mirrors backend Pydantic schemas) ───────────────────────────────

export type GrievanceCategory = "SANITATION" | "ROADS" | "ELECTRICITY" | "WATER" | "OTHER";
export type GrievanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
export type ProjectStatus = "PROPOSED" | "VOTING" | "FUNDED" | "IN_PROGRESS" | "COMPLETED";

export interface ResolutionEvidenceOut {
  id: string;
  grievance_id: string;
  officer_id: string | null;
  proof_image_url: string | null;
  comments: string;
  resolved_at: string;
}

export interface GrievancePublic {
  id: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  status: GrievanceStatus;
  priority_score: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  image_url: string | null;
  audio_url: string | null;
  is_duplicate: boolean;
  parent_grievance_id: string | null;
  upvote_count: number;
  citizen_id: string | null;
  created_at: string;
  updated_at: string;
  evidence: ResolutionEvidenceOut[];
}

export interface GrievanceCreateResponse {
  id: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  status: GrievanceStatus;
  priority_score: number;
  is_duplicate: boolean;
  parent_grievance_id: string | null;
  upvote_count: number;
  urgency_summary: string | null;
  created_at: string;
}

export interface ProjectOut {
  id: string;
  title: string;
  description: string;
  budget_allocated: number;
  target_votes: number;
  current_votes: number;
  category: string;
  status: ProjectStatus;
  created_at: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface StatsOut {
  total_reported: number;
  auto_deduplicated: number;
  resolved_percent: number;
  by_category: CategoryCount[];
}

// ── Axios instance ─────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  timeout: 30_000,
});

// Response interceptor: log errors in development
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", err.response?.data || err.message);
    }
    return Promise.reject(err);
  }
);

// ── Typed wrappers ─────────────────────────────────────────────────────────

/** Submit a new grievance (multipart form). */
export async function submitGrievance(
  formData: FormData
): Promise<GrievanceCreateResponse> {
  const res: AxiosResponse<GrievanceCreateResponse> = await api.post(
    "/api/grievances/submit",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

/** Get public (non-duplicate) grievances with optional filters. */
export async function getPublicGrievances(params?: {
  category?: string;
  status?: string;
}): Promise<GrievancePublic[]> {
  const res: AxiosResponse<GrievancePublic[]> = await api.get(
    "/api/grievances/public",
    { params }
  );
  return res.data;
}

/** Get a single grievance by ID. */
export async function getGrievance(id: string): Promise<GrievancePublic> {
  const res: AxiosResponse<GrievancePublic> = await api.get(
    `/api/grievances/${id}`
  );
  return res.data;
}

/** Get all grievances for a specific citizen. */
export async function getCitizenGrievances(
  citizenId: string
): Promise<GrievancePublic[]> {
  const res: AxiosResponse<GrievancePublic[]> = await api.get(
    `/api/grievances/citizen/${citizenId}`
  );
  return res.data;
}

/** Resolve a grievance with evidence (multipart form). */
export async function resolveGrievance(
  id: string,
  formData: FormData
): Promise<GrievancePublic> {
  const res: AxiosResponse<GrievancePublic> = await api.post(
    `/api/grievances/${id}/resolve`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

/** Get all participatory projects. */
export async function getProjects(): Promise<ProjectOut[]> {
  const res: AxiosResponse<ProjectOut[]> = await api.get(
    "/api/budgeting/projects"
  );
  return res.data;
}

/** Vote for a participatory project. */
export async function voteForProject(
  projectId: string,
  citizenId: string
): Promise<ProjectOut> {
  const res: AxiosResponse<ProjectOut> = await api.post(
    `/api/budgeting/${projectId}/vote`,
    { citizen_id: citizenId }
  );
  return res.data;
}

/** Get admin dashboard statistics. */
export async function getStats(): Promise<StatsOut> {
  const res: AxiosResponse<StatsOut> = await api.get("/api/admin/stats");
  return res.data;
}

export default api;
