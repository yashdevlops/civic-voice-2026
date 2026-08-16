export function getCurrentMonthLabel(d: Date = new Date()): string {
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

export function getTodayLabel(d: Date = new Date()): string {
  return d.toLocaleString("default", { day: "numeric", month: "long", year: "numeric" });
}

export function getMonthRange(d: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}
