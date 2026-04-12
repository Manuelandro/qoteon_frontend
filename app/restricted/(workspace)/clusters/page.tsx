import { getCoreProjectVisibilityClusters } from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import { sortClustersWeakFirst } from "../_components/dashboard-helpers";
import {
  formatPercent,
  formatScore,
  formatTrendDelta,
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
  title: "Clusters | Qoteon",
  description: "Prompt-intent cluster visibility for Qoteon.",
};

export default async function ClustersPage() {
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Cluster analysis becomes available after onboarding creates the project."
          eyebrow="Clusters"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const clustersResult = await getCoreProjectVisibilityClusters(state.project.id, {
    sortBy: "visibilityScore",
    sortDirection: "asc",
  }).catch(() => null);

  if (!clustersResult) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Clusters show which prompt-intent groups are strong or weak for the current project."
          eyebrow="Clusters"
          title="Which prompt-intent clusters need attention first?"
        />
        <ErrorStatePanel
          description="Cluster breakdown data could not be loaded from Core."
          title="Cluster analysis is temporarily unavailable."
        />
      </DashboardPage>
    );
  }

  const orderedClusters = sortClustersWeakFirst(clustersResult.items);
  const strongestCluster = [...orderedClusters]
    .sort((left, right) => right.visibilityScore - left.visibilityScore)[0] ?? null;
  const weakestCluster = orderedClusters[0] ?? null;
  const weakClusterCount = orderedClusters.filter(
    (cluster) => cluster.statusLabel === "weak",
  ).length;
  const reviewFirst = orderedClusters.slice(0, 3);

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="Clusters matter because they reveal where the client is weak by intent, not just in aggregate. This page should be read like a priority board."
        eyebrow="Clusters"
        title="Which prompt-intent clusters are strong, and which are weak?"
      />

      <SurfaceCard>
        <SectionHeading
          description="The page is ordered weak-first so the most urgent prompt-intent gaps are visible immediately."
          eyebrow="Summary"
          title="Cluster summary"
        />

        <div className="mt-7">
          <SummaryStrip
            items={[
              {
                label: "Strongest cluster",
                value: strongestCluster?.clusterName ?? "Not available",
                detail: strongestCluster
                  ? `Visibility ${formatScore(strongestCluster.visibilityScore)}`
                  : "No cluster-level run data is available yet.",
                tone: "positive",
              },
              {
                label: "Weakest cluster",
                value: weakestCluster?.clusterName ?? "Not available",
                detail: weakestCluster
                  ? `Pressure ${formatPercent(weakestCluster.competitorPressure)}`
                  : "No cluster-level run data is available yet.",
                tone: "negative",
              },
              {
                label: "Weak clusters",
                value: String(weakClusterCount),
                detail: "Clusters currently labeled weak by dashboard scoring.",
                tone: "warning",
              },
            ]}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="These are the first three clusters to review because they combine weak visibility with competitive pressure."
          eyebrow="Review first"
          title="Immediate priorities"
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {reviewFirst.length > 0 ? (
            reviewFirst.map((cluster) => (
              <div
                key={cluster.clusterName}
                className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-black">{cluster.clusterName}</p>
                  <StatusChip
                    label={cluster.statusLabel}
                    tone={
                      cluster.statusLabel === "strong"
                        ? "positive"
                        : cluster.statusLabel === "weak"
                          ? "negative"
                          : "warning"
                    }
                  />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-black/62">
                  <p>Visibility {formatScore(cluster.visibilityScore)}</p>
                  <p>Competitor pressure {formatPercent(cluster.competitorPressure)}</p>
                  <p>Mention rate {formatPercent(cluster.mentionRate)}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyStatePanel
              description="No cluster rows are available yet. Once the first run completes, this area will surface the weakest prompt-intent groups."
              eyebrow="Clusters"
              title="No clusters to review yet"
            />
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="Full cluster breakdown ordered weak-first for analyst triage."
          eyebrow="Breakdown"
          title="Cluster comparison"
        />

        <div className="mt-7">
          <DashboardTable
            columns={[
              "Cluster",
              "Mention rate",
              "Avg position",
              "Share of voice",
              "Competitor pressure",
              "Visibility",
              "Status",
              "Trend delta",
            ]}
            emptyState={
              <EmptyStatePanel
                description="No cluster comparison rows are available yet. This usually means the project does not have a completed or partial run."
                eyebrow="Clusters"
                title="No cluster analysis yet"
              />
            }
            rows={orderedClusters.map((cluster) => ({
              key: cluster.clusterName,
              cells: [
                <div key="cluster">
                  <p className="font-medium text-black">{cluster.clusterName}</p>
                  <p className="mt-1 text-xs text-black/45">
                    {cluster.totalExecutions} executions
                  </p>
                </div>,
                <span key="mention-rate">{formatPercent(cluster.mentionRate)}</span>,
                <span key="avg-position">{formatScore(cluster.avgPosition, { decimals: 2 })}</span>,
                <span key="share-of-voice">{formatPercent(cluster.shareOfVoice)}</span>,
                <span key="pressure">{formatPercent(cluster.competitorPressure)}</span>,
                <span key="visibility">{formatScore(cluster.visibilityScore)}</span>,
                <StatusChip
                  key="status"
                  label={cluster.statusLabel}
                  tone={
                    cluster.statusLabel === "strong"
                      ? "positive"
                      : cluster.statusLabel === "weak"
                        ? "negative"
                        : "warning"
                  }
                />,
                cluster.trend ? (
                  <StatusChip
                    key="trend"
                    label={formatTrendDelta(
                      cluster.trend.overallDirection,
                      cluster.trend.visibilityScoreDelta,
                      "score",
                    )}
                    tone={
                      cluster.trend.overallDirection === "up"
                        ? "positive"
                        : cluster.trend.overallDirection === "down"
                          ? "negative"
                          : "muted"
                    }
                  />
                ) : (
                  <span key="trend" className="text-black/45">
                    No previous comparable run
                  </span>
                ),
              ],
            }))}
          />
        </div>
      </SurfaceCard>
    </DashboardPage>
  );
}
