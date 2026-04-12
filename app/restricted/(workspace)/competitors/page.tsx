import {
  getCoreProjectVisibilityCompetitors,
  getCoreProjectVisibilitySummary,
} from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import { sortCompetitorsThreatFirst } from "../_components/dashboard-helpers";
import {
  formatList,
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

export default async function CompetitorsPage() {
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
      sortBy: "winsAgainstClientCount",
      sortDirection: "desc",
    }),
    getCoreProjectVisibilitySummary(state.project.id),
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

  const orderedCompetitors = sortCompetitorsThreatFirst(competitors?.items ?? []);
  const topCompetitor = competitors?.summary.topCompetitor ?? orderedCompetitors[0] ?? null;
  const dominantClusters = Array.from(
    new Set((competitors?.summary.dominantClusters ?? []).map((item) => item.clusterName)),
  ).slice(0, 4);

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
          description="Competitive pressure is shown at the page level, then broken down by named competitor."
          eyebrow="Summary"
          title="Competitive battlefield"
        />

        <div className="mt-7">
          <SummaryStrip
            items={[
              {
                label: "Top competitor",
                value: topCompetitor?.competitorName ?? "Not available",
                detail: topCompetitor
                  ? `${topCompetitor.winsAgainstClientCount} wins against client`
                  : "No competitor metrics are available yet.",
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
                label: "Dominant clusters",
                value: dominantClusters.length > 0 ? formatList(dominantClusters) : "Not available",
                detail:
                  "Clusters where competitors appear most often in the current read model.",
                tone: "info",
              },
            ]}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="Competitors are ranked by how often they beat the client, then by total mention volume."
          eyebrow="Breakdown"
          title="Competitor comparison"
        />

        <div className="mt-7">
          {orderedCompetitors.length === 0 ? (
            <EmptyStatePanel
              description="No competitor metrics are available yet. This can happen when there are no completed or partial runs, or when the current runs did not produce comparable competitor mentions."
              eyebrow="Competitors"
              title="No competitor metrics yet"
            />
          ) : (
            <DashboardTable
              columns={[
                "Competitor",
                "Total mentions",
                "Mention rate",
                "Share of voice",
                "Prompt overlap",
                "Wins vs client",
                "Client delta",
                "Dominant clusters",
              ]}
              rows={orderedCompetitors.map((competitor) => ({
                key: competitor.competitorName,
                cells: [
                  <div key="competitor">
                    <p className="font-medium text-black">{competitor.competitorName}</p>
                  </div>,
                  <span key="total-mentions">{competitor.totalMentions}</span>,
                  <span key="mention-rate">{formatPercent(competitor.mentionRate)}</span>,
                  <span key="share-of-voice">{formatPercent(competitor.shareOfVoice)}</span>,
                  <span key="prompt-overlap">{competitor.promptOverlapCount}</span>,
                  <span key="wins-vs-client">{competitor.winsAgainstClientCount}</span>,
                  <StatusChip
                    key="delta"
                    label={formatScore(competitor.clientVsCompetitorDelta)}
                    tone={
                      competitor.clientVsCompetitorDelta < 0
                        ? "negative"
                        : competitor.clientVsCompetitorDelta > 0
                          ? "positive"
                          : "muted"
                    }
                  />,
                  <span key="dominant-clusters">
                    {competitor.dominantClusters.length > 0
                      ? formatList(competitor.dominantClusters)
                      : "No dominant cluster"}
                  </span>,
                ],
              }))}
            />
          )}
        </div>
      </SurfaceCard>
    </DashboardPage>
  );
}
