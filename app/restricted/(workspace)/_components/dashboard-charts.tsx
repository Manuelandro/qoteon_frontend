import type { CoreDashboardTimeSeriesPoint, CoreDashboardTrendDirection } from "@/utils/core/client";

import {
  formatDateOnly,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "./dashboard-format";
import { EmptyStatePanel, StatusChip } from "./dashboard-ui";

type ChartMetricKind = "percent" | "position" | "score";

type PreparedPoint = {
  label: string;
  value: number;
  x: number;
  y: number;
};

function preparePoints(points: CoreDashboardTimeSeriesPoint[]) {
  const valid = points.filter((point): point is CoreDashboardTimeSeriesPoint & { value: number } =>
    typeof point.value === "number",
  );

  if (valid.length < 2) {
    return {
      prepared: [] as PreparedPoint[],
      min: null,
      max: null,
      startLabel: null,
      endLabel: null,
    };
  }

  const values = valid.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320;
  const height = 120;

  const prepared = valid.map((point, index) => ({
    label: formatDateOnly(point.observedAt),
    value: point.value,
    x: (index / (valid.length - 1)) * width,
    y: height - ((point.value - min) / range) * height,
  }));

  return {
    prepared,
    min,
    max,
    startLabel: formatDateOnly(valid[0]?.observedAt ?? null),
    endLabel: formatDateOnly(valid[valid.length - 1]?.observedAt ?? null),
  };
}

function chartValue(value: number | null, kind: ChartMetricKind) {
  switch (kind) {
    case "percent":
      return formatPercent(value, { decimals: 0 });
    case "position":
      return formatNumber(value, { decimals: 2 });
    case "score":
    default:
      return formatNumber(value, { decimals: 1 });
  }
}

function directionTone(direction: CoreDashboardTrendDirection) {
  switch (direction) {
    case "up":
      return "positive";
    case "down":
      return "negative";
    case "flat":
      return "muted";
    default:
      return "default";
  }
}

export function MetricLineChart({
  title,
  description,
  points,
  latestValue,
  latestTimestamp,
  direction,
  kind,
}: {
  title: string;
  description: string;
  points: CoreDashboardTimeSeriesPoint[];
  latestValue: number | null;
  latestTimestamp: string | null;
  direction: CoreDashboardTrendDirection;
  kind: ChartMetricKind;
}) {
  const { prepared, min, max, startLabel, endLabel } = preparePoints(points);

  if (prepared.length < 2) {
    return (
      <div className="rounded-[1.65rem] border border-black/8 bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-medium text-black">{title}</p>
            <p className="mt-2 text-sm leading-6 text-black/55">{description}</p>
          </div>
          <StatusChip label="Not enough history yet" tone="muted" />
        </div>
        <div className="mt-5">
          <EmptyStatePanel
            eyebrow="History"
            title="Not enough run history yet"
            description="At least two observed points are needed before this trend line becomes interpretable."
          />
        </div>
      </div>
    );
  }

  const polyline = prepared.map((point) => `${point.x},${point.y}`).join(" ");
  const finalPoint = prepared[prepared.length - 1];

  return (
    <div className="rounded-[1.65rem] border border-black/8 bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-black">{title}</p>
          <p className="mt-2 text-sm leading-6 text-black/55">{description}</p>
        </div>
        <StatusChip
          label={chartValue(latestValue, kind)}
          tone={directionTone(direction)}
        />
      </div>

      <div className="mt-6 rounded-[1.35rem] border border-black/8 bg-white/72 p-4">
        <svg
          aria-label={`${title} over time`}
          className="h-40 w-full"
          preserveAspectRatio="none"
          viewBox="0 0 320 140"
        >
          <line x1="0" x2="320" y1="20" y2="20" stroke="rgba(17,17,17,0.08)" strokeDasharray="3 5" />
          <line x1="0" x2="320" y1="70" y2="70" stroke="rgba(17,17,17,0.08)" strokeDasharray="3 5" />
          <line x1="0" x2="320" y1="120" y2="120" stroke="rgba(17,17,17,0.08)" strokeDasharray="3 5" />
          <polyline
            fill="none"
            points={polyline}
            stroke="rgba(43,57,92,0.88)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            transform="translate(0 10)"
          />
          {prepared.map((point) => (
            <circle
              key={`${title}-${point.label}-${point.value}`}
              cx={point.x}
              cy={point.y + 10}
              fill="rgba(43,57,92,0.88)"
              r={point === finalPoint ? 4 : 2.5}
            />
          ))}
        </svg>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-black/48">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">Latest value</p>
          <p className="mt-2 text-sm font-medium text-black">{chartValue(latestValue, kind)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">Observed window</p>
          <p className="mt-2 text-sm font-medium text-black">
            {chartValue(min, kind)} to {chartValue(max, kind)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">Latest point</p>
          <p className="mt-2 text-sm font-medium text-black">
            {formatRelativeTime(latestTimestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}
