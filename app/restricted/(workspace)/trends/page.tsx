import { getCoreProjectVisibilityTrends } from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import { latestMetricPoint } from "../_components/dashboard-helpers";
import { MetricLineChart } from "../_components/dashboard-charts";
import {
  DashboardPage,
  DashboardPageHeader,
  EmptyStatePanel,
  ErrorStatePanel,
  ComparisonCard,
  SectionHeading,
  SurfaceCard,
} from "../_components/dashboard-ui";

export const metadata = {
  title: "Trends | Qoteon",
  description: "Trend reporting for Qoteon visibility metrics.",
};

export default async function TrendsPage() {
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Trend reporting becomes available after onboarding creates the project."
          eyebrow="Trends"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const trends = await getCoreProjectVisibilityTrends(state.project.id, {
    limit: 24,
  }).catch(() => null);

  if (!trends) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="This page compares visibility movement over time, both run-to-run and across the available history window."
          eyebrow="Trends"
          title="Are visibility metrics improving or declining over time?"
        />
        <ErrorStatePanel
          description="Trend data could not be loaded from Core."
          title="Trend reporting is temporarily unavailable."
        />
      </DashboardPage>
    );
  }

  const latestMentionRate = latestMetricPoint(trends.metrics.mentionRate);
  const latestAvgPosition = latestMetricPoint(trends.metrics.avgPosition);
  const latestVisibilityScore = latestMetricPoint(trends.metrics.visibilityScore);
  const latestShareOfVoice = latestMetricPoint(trends.metrics.shareOfVoice);
  const enoughHistory =
    trends.metrics.mentionRate.filter((point) => point.value !== null).length >= 2 ||
    trends.metrics.avgPosition.filter((point) => point.value !== null).length >= 2 ||
    trends.metrics.visibilityScore.filter((point) => point.value !== null).length >= 2 ||
    trends.metrics.shareOfVoice.filter((point) => point.value !== null).length >= 2;

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="Trend reporting is the measured view: how the latest run compares with previous evidence, and whether visibility is moving in a stable direction or slipping."
        eyebrow="Trends"
        title="Is the client improving, holding steady, or declining?"
      />

      <SurfaceCard>
        <SectionHeading
          description="Three comparison windows: latest run, daily tracking where available, and the baseline-to-latest shift."
          eyebrow="Comparisons"
          title="Run comparisons"
        />

        <div className="mt-7 grid gap-4 xl:grid-cols-3">
          <ComparisonCard
            description="Latest comparable run against the immediately previous run."
            direction={
              trends.comparisons.latestVsPreviousRun?.overallDirection ?? "unavailable"
            }
            metrics={[
              {
                label: "Visibility score",
                delta: trends.comparisons.latestVsPreviousRun?.visibilityScore.delta ?? null,
                metricType: "score",
              },
              {
                label: "Mention rate",
                delta: trends.comparisons.latestVsPreviousRun?.mentionRate.delta ?? null,
                metricType: "percent",
              },
              {
                label: "Avg position",
                delta: trends.comparisons.latestVsPreviousRun?.avgPosition.delta ?? null,
                metricType: "position",
              },
            ]}
            title="Latest vs previous run"
          />
          <ComparisonCard
            description="Daily tracking against the prior daily tracking point."
            direction={
              trends.comparisons.latestDailyVsPreviousDaily?.overallDirection ??
              "unavailable"
            }
            metrics={[
              {
                label: "Visibility score",
                delta:
                  trends.comparisons.latestDailyVsPreviousDaily?.visibilityScore.delta ??
                  null,
                metricType: "score",
              },
              {
                label: "Mention rate",
                delta:
                  trends.comparisons.latestDailyVsPreviousDaily?.mentionRate.delta ??
                  null,
                metricType: "percent",
              },
              {
                label: "Share of voice",
                delta:
                  trends.comparisons.latestDailyVsPreviousDaily?.shareOfVoice.delta ??
                  null,
                metricType: "percent",
              },
            ]}
            title="Latest daily vs previous daily"
          />
          <ComparisonCard
            description="Current run against the earliest baseline captured for this project."
            direction={trends.comparisons.baselineVsLatest?.overallDirection ?? "unavailable"}
            metrics={[
              {
                label: "Visibility score",
                delta: trends.comparisons.baselineVsLatest?.visibilityScore.delta ?? null,
                metricType: "score",
              },
              {
                label: "Mention rate",
                delta: trends.comparisons.baselineVsLatest?.mentionRate.delta ?? null,
                metricType: "percent",
              },
              {
                label: "Share of voice",
                delta: trends.comparisons.baselineVsLatest?.shareOfVoice.delta ?? null,
                metricType: "percent",
              },
            ]}
            title="Baseline vs latest"
          />
        </div>
      </SurfaceCard>

      {!enoughHistory ? (
        <SurfaceCard>
          <EmptyStatePanel
            description="At least two observed points are needed before the trend charts become useful. Keep running baseline or daily tracking to build history."
            eyebrow="History"
            title="Not enough run history yet"
          />
        </SurfaceCard>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <MetricLineChart
          description="Overall visibility score across the available time window."
          direction={
            trends.comparisons.latestVsPreviousRun?.visibilityScore.direction ??
            "unavailable"
          }
          kind="score"
          latestTimestamp={latestVisibilityScore?.observedAt ?? null}
          latestValue={latestVisibilityScore?.value ?? null}
          points={trends.metrics.visibilityScore}
          title="Visibility score"
        />
        <MetricLineChart
          description="Brand mention rate across analyzed runs."
          direction={
            trends.comparisons.latestVsPreviousRun?.mentionRate.direction ?? "unavailable"
          }
          kind="percent"
          latestTimestamp={latestMentionRate?.observedAt ?? null}
          latestValue={latestMentionRate?.value ?? null}
          points={trends.metrics.mentionRate}
          title="Mention rate"
        />
        <MetricLineChart
          description="Share of tracked answer-set mentions captured by the client."
          direction={
            trends.comparisons.latestVsPreviousRun?.shareOfVoice.direction ?? "unavailable"
          }
          kind="percent"
          latestTimestamp={latestShareOfVoice?.observedAt ?? null}
          latestValue={latestShareOfVoice?.value ?? null}
          points={trends.metrics.shareOfVoice}
          title="Share of voice"
        />
        <MetricLineChart
          description="Average brand mention position. Lower values are better."
          direction={
            trends.comparisons.latestVsPreviousRun?.avgPosition.direction ?? "unavailable"
          }
          kind="position"
          latestTimestamp={latestAvgPosition?.observedAt ?? null}
          latestValue={latestAvgPosition?.value ?? null}
          points={trends.metrics.avgPosition}
          title="Avg position"
        />
      </section>
    </DashboardPage>
  );
}
