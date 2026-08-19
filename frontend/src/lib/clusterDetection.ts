import { GrievanceTicket, MUNICIPAL_DEPARTMENTS } from "./grievance";

export interface ClusterAlert {
  category: string;
  affectedWards: string[]; // e.g. ["BMC Ward 5", "BMC Ward 12", "BMC Ward 23"]
  ticketCount: number;
  severity: "warning" | "critical"; // critical = 5+ wards, warning = 3-4 wards
  sampleTicketIds: string[]; // up to 3 representative ticket IDs
}

/** Minimum wards with same open category to trigger a cluster alert. */
export const CLUSTER_WARD_THRESHOLD = 3;

/** Departments that trigger CRITICAL severity when clustered. */
const CRITICAL_DEPTS = new Set(["water_supply", "public_safety", "roads_potholes"]);

export function detectCrossWardClusters(tickets: GrievanceTicket[]): ClusterAlert[] {
  // Only unresolved tickets with ward info
  const active = tickets.filter(
    (t) => t.wardId && t.status !== "RESOLVED" && t.status !== "CLOSED"
  );

  // Group: departmentCode → ward → ticket IDs
  const map = new Map<string, Map<string, string[]>>();
  for (const ticket of active) {
    const dept = ticket.departmentCode;
    const ward = ticket.wardId;
    if (!map.has(dept)) map.set(dept, new Map());
    const wardMap = map.get(dept)!;
    if (!wardMap.has(ward)) wardMap.set(ward, []);
    wardMap.get(ward)!.push(ticket.id);
  }

  const alerts: ClusterAlert[] = [];

  map.forEach((wardMap, deptCode) => {
    if (wardMap.size >= CLUSTER_WARD_THRESHOLD) {
      const affectedWards = Array.from(wardMap.keys());
      const allTicketIds = affectedWards.flatMap((w) => wardMap.get(w)!);
      const severity: ClusterAlert["severity"] =
        wardMap.size >= 5 || CRITICAL_DEPTS.has(deptCode) ? "critical" : "warning";

      const deptMeta = MUNICIPAL_DEPARTMENTS[deptCode as keyof typeof MUNICIPAL_DEPARTMENTS];

      alerts.push({
        category: deptMeta ? deptMeta.name : deptCode,
        affectedWards,
        ticketCount: allTicketIds.length,
        severity,
        sampleTicketIds: allTicketIds.slice(0, 3),
      });
    }
  });

  // Sort: critical first, then by ward count descending
  alerts.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    return b.affectedWards.length - a.affectedWards.length;
  });

  return alerts;
}
