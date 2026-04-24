import Link from "next/link";

import {
  getCoreProjectVisibilityCompetitors,
  getCoreProjectVisibilitySummary,
} from "@/utils/core/client";
import {
  DASHBOARD_TIME_RANGE_PRESETS,
  type DashboardTimeRangePreset,
  buildDashboardWindow,
  getDashboardTimeRangeLabel,
  isDashboardTimeRangePreset,
} from "@/utils/core/dashboard-windows";
import { getWorkspaceState } from "@/utils/core/workspace";

import {
  formatInteger,
  formatPercent,
  formatScore,
} from "../_components/dashboard-format";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardTable,
  EmptyStatePanel,
  ErrorStatePanel,
  SectionHeading,
  StatusChip,
  SurfaceCard,
  SummaryStrip,
} from "../_components/dashboard-ui";

export const metadata = {
  title: "Competitors | Qoteon",
  description: "Competitive visibility battlefield for Qoteon.",
};

type CompetitorsPageProps = {
  searchParams: Promise<{
    range?: string | string[];
  }>;
};

function readSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

function buildCompetitorsHref(range: DashboardTimeRangePreset) {
  const params = new URLSearchParams();

  if (range !== "last_24h") {
    params.set("range", range);
  }

  const query = params.toString();
  return query ? `/restricted/competitors?${query}` : "/restricted/competitors";
}

function TimeRangeTabs({ currentRange }: { currentRange: DashboardTimeRangePreset }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DASHBOARD_TIME_RANGE_PRESETS.map((range) => (
        <Link
          key={range}
          className={
            range === currentRange
              ? "inline-flex min-h-10 items-center rounded-full border border-black bg-black px-4 py-2 text-sm text-white"
              : "inline-flex min-h-10 items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/62 transition hover:border-black/20 hover:bg-white hover:text-black"
          }
          href={buildCompetitorsHref(range)}
        >
          {getDashboardTimeRangeLabel(range)}
        </Link>
      ))}
    </div>
  );
}

export default async function CompetitorsPage({ searchParams }: CompetitorsPageProps) {
  const params = await searchParams;
  const requestedRange = readSingleValue(params.range);
  const range = isDashboardTimeRangePreset(requestedRange) ? requestedRange : "last_24h";
  const dashboardWindow = buildDashboardWindow(range);
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Competitor analysis becomes available after onboarding creates the project."
          eyebrow="Competitors"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const [competitorsResult, summaryResult] = await Promise.allSettled([
    getCoreProjectVisibilityCompetitors(state.project.id, {
      sortBy: "visibilityScore",
      sortDirection: "desc",
      ...dashboardWindow,
    }),
    getCoreProjectVisibilitySummary(state.project.id, dashboardWindow),
  ]);

  const competitors = competitorsResult.status === "fulfilled" ? competitorsResult.value : null;
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
  const errors = [
    competitorsResult.status === "rejected"
      ? "Competitor metrics could not be loaded from Core."
      : null,
    summaryResult.status === "rejected"
      ? "Overall competitor pressure could not be loaded from Core."
      : null,
  ].filter(Boolean) as string[];

  const orderedCompetitors = competitors?.items ?? [];
  const topCompetitor = competitors?.summary.topCompetitor ?? null;

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="This page answers who is taking the answer set from the client, where that dominance shows up, and how large the gap is."
        eyebrow="Competitors"
        title="Which competitors are beating the client in AI answer sets?"
      />

      {errors.length > 0 ? (
        <ErrorStatePanel
          description={errors.join(" ")}
          title="Some competitor data is temporarily unavailable."
        />
      ) : null}

      <SurfaceCard>
        <SectionHeading
          description="Competitive pressure is shown for the selected rolling window. The comparison list below always keeps the client first."
          eyebrow="Summary"
          title="Competitive battlefield"
          aside={<TimeRangeTabs currentRange={range} />}
        />

        <div className="mt-7">
          <SummaryStrip
            items={[
              {
                label: "Top competitor",
                value: topCompetitor?.entityName ?? "Not available",
                detail: topCompetitor
                  ? `${formatScore(topCompetitor.visibilityScore)} visibility score`
                  : "No competitor surfaced in this window.",
                tone: "negative",
              },
              {
                label: "Competitor pressure",
                value: summary ? formatPercent(summary.competitorPressure) : "Not available",
                detail:
                  "Lower is better. High pressure means competitors occupy too much of the answer set.",
                tone: "warning",
              },
              {
                label: "Selected window",
                value: getDashboardTimeRangeLabel(range),
                detail: orderedCompetitors.length > 0
                  ? `${formatInteger(orderedCompetitors.length)} client and competitor rows`
                  : "No eligible runs exist in this window.",
                tone: "info",
              },
            ]}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="The first row is the client. Configured competitors follow by visibility score descending, including zero-value rows when runs exist in the selected window."
          eyebrow="Breakdown"
          title="Competitor comparison"
        />

        <div className="mt-7">
          {orderedCompetitors.length === 0 ? (
            <EmptyStatePanel
              description="No eligible completed, partial, or failed workflows exist in the selected window, so Qoteon has no comparison rows to aggregate."
              eyebrow="Competitors"
              title="No runs in this window"
            />
          ) : (
            <DashboardTable
              columns={[
                "Entity",
                "Visibility Score",
                "Share of voice",
                "Mentions",
                "Citations",
              ]}
              rows={orderedCompetitors.map((competitor) => ({
                key: `${competitor.entityRole}:${competitor.competitorEntityId ?? competitor.entityName}`,
                cells: [
                  <div key="competitor">
                    <p className="font-medium text-black">{competitor.entityName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/38">
                      {competitor.entityRole === "client" ? "Client" : "Competitor"}
                    </p>
                  </div>,
                  <StatusChip
                    key="visibility-score"
                    label={formatScore(competitor.visibilityScore)}
                    tone={competitor.entityRole === "client" ? "positive" : "warning"}
                  />,
                  <span key="share-of-voice">{formatPercent(competitor.shareOfVoice)}</span>,
                  <span key="mentions">{formatInteger(competitor.totalMentions)}</span>,
                  <span key="citations">{formatInteger(competitor.totalCitations)}</span>,
                ],
              }))}
            />
          )}
        </div>
      </SurfaceCard>
    </DashboardPage>
  );
}
