export const DASHBOARD_TIME_RANGE_PRESETS = [
  "last_24h",
  "last_7d",
  "last_month",
  "last_3_months",
  "last_6_months",
  "last_year",
  "total",
] as const;

export type DashboardTimeRangePreset = (typeof DASHBOARD_TIME_RANGE_PRESETS)[number];

const RANGE_DAYS: Record<Exclude<DashboardTimeRangePreset, "last_24h" | "total">, number> = {
  last_7d: 7,
  last_month: 30,
  last_3_months: 90,
  last_6_months: 180,
  last_year: 365,
};

export function isDashboardTimeRangePreset(value: string | null | undefined): value is DashboardTimeRangePreset {
  return DASHBOARD_TIME_RANGE_PRESETS.includes(value as DashboardTimeRangePreset);
}

export function getDashboardTimeRangeLabel(range: DashboardTimeRangePreset): string {
  switch (range) {
    case "last_24h":
      return "Last 24h";
    case "last_7d":
      return "Last 7d";
    case "last_month":
      return "Last month";
    case "last_3_months":
      return "Last 3 months";
    case "last_6_months":
      return "Last 6 months";
    case "last_year":
      return "Last year";
    case "total":
      return "Total";
  }
}

export function buildDashboardWindow(
  range: DashboardTimeRangePreset,
  now: Date = new Date(),
): { startDate?: string; endDate?: string } {
  if (range === "total") {
    return {};
  }

  const start = new Date(now);

  if (range === "last_24h") {
    start.setHours(start.getHours() - 24);
  } else {
    start.setDate(start.getDate() - RANGE_DAYS[range]);
  }

  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  };
}
