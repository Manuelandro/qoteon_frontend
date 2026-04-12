import Link from "next/link";
import type { ReactNode } from "react";

import type {
  CoreDashboardHealthFlag,
  CoreDashboardHealthFlagSeverity,
  CoreDashboardRunBatchProgress,
  CoreDashboardTrendDirection,
} from "@/utils/core/client";

import {
  describeTrendDirection,
  formatDateTime,
  formatRunType,
  formatStatus,
  formatTrendDelta,
} from "./dashboard-format";

type Tone = "default" | "positive" | "warning" | "negative" | "info" | "muted";

type ActionLink = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone: Tone) {
  switch (tone) {
    case "positive":
      return "border-emerald-700/14 bg-emerald-700/[0.08] text-emerald-950";
    case "warning":
      return "border-amber-700/14 bg-amber-700/[0.08] text-amber-950";
    case "negative":
      return "border-rose-800/14 bg-rose-800/[0.08] text-rose-950";
    case "info":
      return "border-sky-800/14 bg-sky-800/[0.08] text-sky-950";
    case "muted":
      return "border-black/8 bg-black/[0.035] text-black/72";
    default:
      return "border-black/8 bg-[var(--surface)] text-black/78";
  }
}

function trendTone(direction: CoreDashboardTrendDirection): Tone {
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

function healthSeverityTone(severity: CoreDashboardHealthFlagSeverity): Tone {
  switch (severity) {
    case "critical":
      return "negative";
    case "warning":
      return "warning";
    case "info":
    default:
      return "info";
  }
}

function runStatusTone(status: string): Tone {
  switch (status) {
    case "completed":
      return "positive";
    case "partial":
      return "warning";
    case "failed":
      return "negative";
    case "running":
      return "info";
    default:
      return "muted";
  }
}

export function DashboardPage({ children }: { children: ReactNode }) {
  return <main className="grid gap-5">{children}</main>;
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ActionLink[];
}) {
  return (
    <section className="rounded-[2rem] border border-black/8 bg-[#f8f4ec] px-7 py-8 shadow-[0_16px_50px_rgba(17,17,17,0.03)] sm:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">{eyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">{description}</p>
        </div>

        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm transition",
                  action.variant === "primary"
                    ? "border-black bg-black text-white shadow-[0_14px_30px_rgba(17,17,17,0.12)] hover:bg-black/92"
                    : "border-black/10 bg-white/76 text-black/72 hover:border-black/18 hover:bg-white hover:text-black",
                )}
                href={action.href}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-black/8 bg-white px-7 py-7 shadow-[0_18px_60px_rgba(17,17,17,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-black/38">{eyebrow}</p>
        <h3 className="mt-3 font-serif text-2xl leading-tight tracking-[-0.03em] text-black sm:text-3xl">
          {title}
        </h3>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-black/58">{description}</p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

export function StatusChip({
  label,
  tone = "default",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em]",
        toneClasses(tone),
      )}
    >
      {label}
    </span>
  );
}

export function RunStatusChip({ status }: { status: string }) {
  return <StatusChip label={formatStatus(status)} tone={runStatusTone(status)} />;
}

export function TrendBadge({
  direction,
  label,
}: {
  direction: CoreDashboardTrendDirection;
  label: string;
}) {
  return <StatusChip label={label} tone={trendTone(direction)} />;
}

export function KpiCard({
  label,
  value,
  detail,
  trendDirection,
  trendLabel,
  emphasis = false,
}: {
  label: string;
  value: string;
  detail?: string;
  trendDirection?: CoreDashboardTrendDirection;
  trendLabel?: string;
  emphasis?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-[1.65rem] border p-5",
        emphasis
          ? "border-black/10 bg-[#f5efe3] shadow-[0_14px_34px_rgba(17,17,17,0.05)]"
          : "border-black/8 bg-[var(--surface)]",
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-black/42">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-black">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-black/55">{detail}</p> : null}
      {trendLabel ? (
        <div className="mt-4">
          <TrendBadge
            direction={trendDirection ?? "unavailable"}
            label={trendLabel}
          />
        </div>
      ) : null}
    </article>
  );
}

export function SummaryStrip({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    detail?: string;
    tone?: Tone;
  }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className={cn("rounded-[1.5rem] border p-5", toneClasses(item.tone ?? "default"))}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-60">{item.label}</p>
          <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">{item.value}</p>
          {item.detail ? <p className="mt-2 text-sm leading-6 opacity-80">{item.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function HealthFlagList({
  flags,
  emptyMessage = "No health flags are active.",
}: {
  flags: CoreDashboardHealthFlag[];
  emptyMessage?: string;
}) {
  if (flags.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
        <p className="text-sm leading-7 text-black/62">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {flags.map((flag) => (
        <div
          key={flag.code}
          className={cn(
            "rounded-[1.5rem] border p-5",
            toneClasses(healthSeverityTone(flag.severity)),
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip
              label={flag.severity}
              tone={healthSeverityTone(flag.severity)}
            />
            <p className="text-sm font-medium">{flag.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyStatePanel({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ActionLink;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-[#faf8f3] p-7">
      <p className="text-[11px] uppercase tracking-[0.2em] text-black/38">{eyebrow}</p>
      <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em] text-black">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-black/58">{description}</p>
      {action ? (
        <div className="mt-5">
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/18 hover:text-black"
            href={action.href}
          >
            {action.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorStatePanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-rose-900/10 bg-rose-900/[0.05] p-7 text-rose-950">
      <p className="text-[11px] uppercase tracking-[0.2em] text-rose-950/60">Data error</p>
      <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-950/80">{description}</p>
    </div>
  );
}

export function PreviewModule({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <SurfaceCard className="px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl tracking-[-0.03em] text-black">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-black/58">{description}</p>
        </div>
        <Link
          className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/18 hover:text-black"
          href={href}
        >
          Open page
        </Link>
      </div>
      <div className="mt-6">{children}</div>
    </SurfaceCard>
  );
}

export function DashboardTable({
  columns,
  rows,
  emptyState,
}: {
  columns: string[];
  rows: Array<{
    key: string;
    cells: ReactNode[];
  }>;
  emptyState?: ReactNode;
}) {
  if (rows.length === 0) {
    return emptyState ?? null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 pb-1 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-black/38"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="align-top">
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.key}-${index}`}
                  className={cn(
                    "border-y border-black/8 bg-[var(--surface)] px-4 py-4 text-sm text-black/72 first:rounded-l-[1.3rem] first:border-l last:rounded-r-[1.3rem] last:border-r",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MetricStack({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-black">{value}</p>
      {detail ? <p className="mt-1 text-sm leading-6 text-black/55">{detail}</p> : null}
    </div>
  );
}

export function LabeledValueList({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    detail?: string;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5"
        >
          <MetricStack {...item} />
        </div>
      ))}
    </div>
  );
}

export function ComparisonCard({
  title,
  description,
  direction,
  metrics,
}: {
  title: string;
  description: string;
  direction: CoreDashboardTrendDirection;
  metrics: Array<{
    label: string;
    delta: number | null;
    metricType: "percent" | "score" | "position";
  }>;
}) {
  return (
    <div className="rounded-[1.55rem] border border-black/8 bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="mt-2 text-sm leading-6 text-black/55">{description}</p>
        </div>
        <StatusChip label={describeTrendDirection(direction)} tone={trendTone(direction)} />
      </div>
      <div className="mt-5 grid gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/55">{metric.label}</span>
            <span className="text-right font-medium text-black">
              {formatTrendDelta(direction, metric.delta, metric.metricType)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RunListItem({
  run,
  isActive,
  href,
  completedExecutions,
  failedExecutions,
}: {
  run: CoreDashboardRunBatchProgress & {
    createdAt?: string;
  };
  isActive: boolean;
  href: string;
  completedExecutions: number;
  failedExecutions: number;
}) {
  return (
    <Link
      className={cn(
        "block rounded-[1.5rem] border p-5 transition",
        isActive
          ? "border-black bg-black text-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]"
          : "border-black/8 bg-[var(--surface)] hover:border-black/15 hover:bg-white",
      )}
      href={href}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-black")}>
            {formatRunType(run.runType)}
          </p>
          <p
            className={cn(
              "mt-2 text-sm leading-6",
              isActive ? "text-white/72" : "text-black/55",
            )}
          >
            Started {formatDateTime(run.startedAt ?? run.createdAt ?? null, "Not started")}
          </p>
        </div>
        <RunStatusChip status={run.status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className={cn("text-[11px] uppercase tracking-[0.16em]", isActive ? "text-white/45" : "text-black/38")}>
            Total
          </p>
          <p className={cn("mt-2 text-lg font-semibold", isActive ? "text-white" : "text-black")}>
            {run.totalExecutions}
          </p>
        </div>
        <div>
          <p className={cn("text-[11px] uppercase tracking-[0.16em]", isActive ? "text-white/45" : "text-black/38")}>
            Complete
          </p>
          <p className={cn("mt-2 text-lg font-semibold", isActive ? "text-white" : "text-black")}>
            {completedExecutions}
          </p>
        </div>
        <div>
          <p className={cn("text-[11px] uppercase tracking-[0.16em]", isActive ? "text-white/45" : "text-black/38")}>
            Failed
          </p>
          <p className={cn("mt-2 text-lg font-semibold", isActive ? "text-white" : "text-black")}>
            {failedExecutions}
          </p>
        </div>
      </div>
    </Link>
  );
}
