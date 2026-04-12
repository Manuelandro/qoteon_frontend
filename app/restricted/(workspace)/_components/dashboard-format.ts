import type {
  CoreDashboardComparisonValue,
  CoreDashboardRunType,
  CoreDashboardTrendDirection,
} from "@/utils/core/client";

type NumberFormatOptions = {
  decimals?: number;
  fallback?: string;
};

type PercentFormatOptions = NumberFormatOptions & {
  signed?: boolean;
};

export function formatPercent(
  value: number | null | undefined,
  options: PercentFormatOptions = {},
) {
  if (value === null || value === undefined) {
    return options.fallback ?? "Not available";
  }

  const percent = value * 100;
  const fixed = percent.toFixed(options.decimals ?? 0);
  const normalized = removeTrailingZeroes(fixed);
  const prefix = options.signed && percent > 0 ? "+" : "";

  return `${prefix}${normalized}%`;
}

export function formatScore(
  value: number | null | undefined,
  options: NumberFormatOptions = {},
) {
  if (value === null || value === undefined) {
    return options.fallback ?? "Not available";
  }

  return removeTrailingZeroes(value.toFixed(options.decimals ?? 1));
}

export function formatNumber(
  value: number | null | undefined,
  options: NumberFormatOptions = {},
) {
  if (value === null || value === undefined) {
    return options.fallback ?? "Not available";
  }

  return removeTrailingZeroes(value.toFixed(options.decimals ?? 0));
}

export function formatInteger(value: number | null | undefined, fallback = "0") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return new Intl.NumberFormat("en").format(value);
}

export function formatDateTime(value: string | null | undefined, fallback = "Not available") {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateOnly(value: string | null | undefined, fallback = "Not available") {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string | null | undefined, fallback = "Not available") {
  if (!value) {
    return fallback;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return fallback;
  }

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);

  if (Math.abs(diffMonths) < 12) {
    return formatter.format(diffMonths, "month");
  }

  const diffYears = Math.round(diffMonths / 12);
  return formatter.format(diffYears, "year");
}

export function formatRunType(value: CoreDashboardRunType | string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatStatus(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function formatList(value: string[], fallback = "Not available") {
  if (value.length === 0) {
    return fallback;
  }

  return value.join(", ");
}

export function formatComparisonDelta(
  comparison: CoreDashboardComparisonValue | null | undefined,
  metricType: "percent" | "score" | "position",
) {
  if (!comparison || comparison.delta === null) {
    return "No previous comparable run";
  }

  const movement = describeTrendDirection(comparison.direction);
  const magnitude = formatDeltaMagnitude(comparison.delta, metricType);

  if (comparison.direction === "flat") {
    return `Flat vs previous (${magnitude})`;
  }

  return `${movement} vs previous (${magnitude})`;
}

export function formatTrendDelta(
  direction: CoreDashboardTrendDirection,
  delta: number | null,
  metricType: "percent" | "score" | "position",
) {
  if (delta === null) {
    return "No previous comparable run";
  }

  const magnitude = formatDeltaMagnitude(delta, metricType);

  if (direction === "flat") {
    return `Flat (${magnitude})`;
  }

  if (direction === "unavailable") {
    return "No previous comparable run";
  }

  return `${describeTrendDirection(direction)} (${magnitude})`;
}

export function describeTrendDirection(direction: CoreDashboardTrendDirection) {
  switch (direction) {
    case "up":
      return "Improving";
    case "down":
      return "Declining";
    case "flat":
      return "Flat";
    default:
      return "Unavailable";
  }
}

function formatDeltaMagnitude(
  delta: number,
  metricType: "percent" | "score" | "position",
) {
  const absolute = Math.abs(delta);

  switch (metricType) {
    case "percent":
      return `${removeTrailingZeroes((absolute * 100).toFixed(1))} pts`;
    case "position":
      return `${removeTrailingZeroes(absolute.toFixed(2))} positions`;
    case "score":
    default:
      return `${removeTrailingZeroes(absolute.toFixed(1))} pts`;
  }
}

function removeTrailingZeroes(value: string) {
  return value.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}
