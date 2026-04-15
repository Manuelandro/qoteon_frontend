import Link from "next/link";

import { getCoreApiBaseUrl } from "@/utils/core/env";
import {
  getCoreProjectOverview,
  getCoreProjectPromptContext,
  type CoreProjectOverview,
  type CorePromptContext,
} from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import { sortClustersWeakFirst, sortCompetitorsThreatFirst, sortModelsStrongFirst } from "./_components/dashboard-helpers";
import {
  describeTrendDirection,
  formatComparisonDelta,
  formatDateTime,
  formatDomain,
  formatList,
  formatPercent,
  formatRelativeTime,
  formatScore,
  formatStatus,
} from "./_components/dashboard-format";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardTable,
  EmptyStatePanel,
  ErrorStatePanel,
  HealthFlagList,
  KpiCard,
  MetricStack,
  PreviewModule,
  SectionHeading,
  StatusChip,
  SurfaceCard,
  SummaryStrip,
} from "./_components/dashboard-ui";
import { ProjectOnboardingProgressModal } from "./project-onboarding-progress-modal";

export const metadata = {
  title: "Overview | Qoteon",
  description: "Analyst overview for Qoteon visibility performance.",
};

type RestrictedPageProps = {
  searchParams: Promise<{
    onboarding?: string;
    projectId?: string;
  }>;
};

type LoadOutcome = {
  overview: CoreProjectOverview | null;
  promptContext: CorePromptContext | null;
  errors: string[];
};

async function loadOverviewData(projectId: string): Promise<LoadOutcome> {
  const [overviewResult, promptContextResult] = await Promise.allSettled([
    getCoreProjectOverview(projectId),
    getCoreProjectPromptContext(projectId),
  ]);

  const errors: string[] = [];

  if (overviewResult.status === "rejected") {
    errors.push("Overview metrics could not be loaded from Core.");
  }

  if (promptContextResult.status === "rejected") {
    errors.push("Prompt-context readiness could not be loaded from Core.");
  }

  return {
    overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
    promptContext:
      promptContextResult.status === "fulfilled" ? promptContextResult.value : null,
    errors,
  };
}

export default async function RestrictedPage({ searchParams }: RestrictedPageProps) {
  const params = await searchParams;
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="The overview becomes available after the first project is created through onboarding."
          eyebrow="Overview"
          title="No project workspace is available yet."
        />
        <SurfaceCard>
          <EmptyStatePanel
            action={{
              href: "/restricted/onboarding/company",
              label: "Open onboarding",
            }}
            description="Complete the company setup first so Qoteon can create the project, crawl the client site, and prepare the first dashboard reads."
            eyebrow="Workspace"
            title="Start with project setup"
          />
        </SurfaceCard>
      </DashboardPage>
    );
  }

  const { overview, promptContext, errors } = await loadOverviewData(state.project.id);
  const summary = overview?.latestKpis ?? null;
  const comparison = summary?.comparedToPrevious ?? null;
  const strongestModels = sortModelsStrongFirst(overview?.previews.models ?? []).slice(0, 4);
  const weakestClusters = sortClustersWeakFirst(overview?.previews.clusters ?? []).slice(0, 4);
  const threatenedBy = sortCompetitorsThreatFirst(overview?.previews.competitors ?? []).slice(0, 4);
  const recentRuns = overview?.previews.recentRuns ?? [];
  const latestRunFreshness = overview?.latestRun?.completedAt ?? overview?.latestRun?.startedAt ?? null;
  const coreApiBaseUrl = getCoreApiBaseUrl();

  return (
    <>
      <DashboardPage>
      <DashboardPageHeader
        actions={[
          {
            href: "/restricted/clusters",
            label: "Review weak clusters",
            variant: "primary",
          },
          {
            href: "/restricted/runs",
            label: "Inspect runs",
          },
        ]}
        description="The overview is the analyst command center: current visibility, competitive pressure, weak intent clusters, and whether the underlying data is trustworthy enough to interpret."
        eyebrow="Overview"
        title="Are we visible in AI answers right now, and where are we weak?"
      />

      {errors.length > 0 ? (
        <ErrorStatePanel
          description={errors.join(" ")}
          title="Some overview data is temporarily unavailable."
        />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SurfaceCard>
          <SectionHeading
            description="Current project metadata from Core. This is the baseline context for every dashboard read."
            eyebrow="Project"
            title={state.project.company_name}
            aside={<StatusChip label={formatStatus(state.project.status)} tone="default" />}
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.45rem] border border-black/8 bg-[#f6efe2] p-5 xl:col-span-2">
              <MetricStack
                detail="Tracked domain"
                label="Website"
                value={formatDomain(state.project.domain)}
              />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack label="Status" value={formatStatus(state.project.status)} />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack label="Category" value={state.project.primary_category} />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack label="Language" value={state.project.target_language} />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack
                label="Region"
                value={formatList(state.project.target_region)}
              />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeading
            description="Readiness and freshness signals that indicate whether dashboard interpretation is safe."
            eyebrow="Data trust"
            title="Interpretation status"
          />

          <div className="mt-7 grid gap-4">
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack
                detail={
                  promptContext?.is_ready_for_prompt_generation
                    ? "Crawl-backed website intelligence is ready."
                    : "Crawl-backed website intelligence is still being assembled."
                }
                label="Website intelligence"
                value={promptContext?.is_ready_for_prompt_generation ? "Ready" : "Not ready"}
              />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack
                detail={promptContext?.client_website_crawl_message ?? "Client crawl status from Source Intelligence."}
                label="Client crawl"
                value={
                  promptContext
                    ? formatStatus(promptContext.client_website_crawl_status)
                    : "Unavailable"
                }
              />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack
                detail={
                  latestRunFreshness
                    ? `Latest run observed ${formatRelativeTime(latestRunFreshness)}`
                    : "No completed or partial run is available yet."
                }
                label="Latest run"
                value={
                  overview?.latestRun ? formatStatus(overview.latestRun.status) : "No runs"
                }
              />
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5">
              <MetricStack
                detail="Last successful client crawl captured by Source Intelligence."
                label="Last successful crawl"
                value={formatDateTime(promptContext?.last_successful_crawl_at)}
              />
            </div>
          </div>
        </SurfaceCard>
      </section>

      <SurfaceCard>
        <SectionHeading
          description="Current KPI levels and movement versus the previous comparable run when that comparison exists."
          eyebrow="Current posture"
          title="Visibility and pressure"
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            detail="Weighted visibility across the latest comparable run."
            emphasis
            label="Visibility score"
            trendDirection={comparison?.visibilityScore.direction}
            trendLabel={formatComparisonDelta(comparison?.visibilityScore, "score")}
            value={formatScore(summary?.visibilityScore)}
          />
          <KpiCard
            detail="Share of analyzed responses that mention the client."
            label="Mention rate"
            trendDirection={comparison?.mentionRate.direction}
            trendLabel={formatComparisonDelta(comparison?.mentionRate, "percent")}
            value={formatPercent(summary?.mentionRate)}
          />
          <KpiCard
            detail="Lower is better. Average brand mention position in answers."
            label="Avg position"
            trendDirection={comparison?.avgPosition.direction}
            trendLabel={formatComparisonDelta(comparison?.avgPosition, "position")}
            value={formatScore(summary?.avgPosition, { decimals: 2 })}
          />
          <KpiCard
            detail="Share of tracked mentions captured by the client."
            label="Share of voice"
            trendDirection={comparison?.shareOfVoice.direction}
            trendLabel={formatComparisonDelta(comparison?.shareOfVoice, "percent")}
            value={formatPercent(summary?.shareOfVoice)}
          />
          <KpiCard
            detail="Cluster coverage where the client appears."
            label="Prompt coverage"
            trendDirection={comparison?.promptCoverage.direction}
            trendLabel={formatComparisonDelta(comparison?.promptCoverage, "percent")}
            value={formatPercent(summary?.promptCoverage)}
          />
          <KpiCard
            detail="Models where the client appears at least once."
            label="Model coverage"
            trendLabel="No previous comparable run"
            value={summary ? formatPercent(summary.modelCoverage.coverageRate) : "Not available"}
          />
          <KpiCard
            detail="Lower is better. Measures how often competitors occupy the answer set."
            emphasis
            label="Competitor pressure"
            trendDirection={comparison?.competitorPressure.direction}
            trendLabel={formatComparisonDelta(comparison?.competitorPressure, "percent")}
            value={formatPercent(summary?.competitorPressure)}
          />
        </div>
      </SurfaceCard>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
        <SurfaceCard>
          <SectionHeading
            description="The strongest and weakest signals worth acting on first."
            eyebrow="Key insights"
            title="What stands out"
          />
          <div className="mt-7">
            <SummaryStrip
              items={[
                {
                  label: "Strongest model",
                  value: overview?.keyInsights.strongestModel?.modelName ?? "Not available",
                  detail: overview?.keyInsights.strongestModel
                    ? `Visibility ${formatScore(overview.keyInsights.strongestModel.visibilityScore)}`
                    : "No model-level visibility data is available yet.",
                  tone: "positive",
                },
                {
                  label: "Weakest model",
                  value: overview?.keyInsights.weakestModel?.modelName ?? "Not available",
                  detail: overview?.keyInsights.weakestModel
                    ? `Visibility ${formatScore(overview.keyInsights.weakestModel.visibilityScore)}`
                    : "No model-level visibility data is available yet.",
                  tone: "warning",
                },
                {
                  label: "Weakest cluster",
                  value: overview?.keyInsights.weakestCluster?.clusterName ?? "Not available",
                  detail: overview?.keyInsights.weakestCluster
                    ? `Visibility ${formatScore(overview.keyInsights.weakestCluster.visibilityScore)}`
                    : "No cluster-level visibility data is available yet.",
                  tone: "negative",
                },
                {
                  label: "Top competitor",
                  value: overview?.keyInsights.topCompetitor?.competitorName ?? "Not available",
                  detail: overview?.keyInsights.topCompetitor
                    ? `${overview.keyInsights.topCompetitor.winsAgainstClientCount} wins against client`
                    : "No competitor metrics are available yet.",
                  tone: "negative",
                },
                {
                  label: "Overall trend",
                  value: describeTrendDirection(
                    overview?.keyInsights.visibilityTrendDirection ?? "unavailable",
                  ),
                  detail:
                    comparison
                      ? `Compared with run ${comparison.comparedRunBatchId.slice(0, 8)}`
                      : "No previous comparable run is available.",
                  tone:
                    overview?.keyInsights.visibilityTrendDirection === "up"
                      ? "positive"
                      : overview?.keyInsights.visibilityTrendDirection === "down"
                        ? "negative"
                        : "muted",
                },
              ]}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeading
            description="Weaknesses and directional warnings from the latest comparable run."
            eyebrow="Health flags"
            title="Issues to scan first"
          />
          <div className="mt-7">
            <HealthFlagList
              emptyMessage="No health flags are active for the latest comparable run."
              flags={overview?.healthFlags ?? []}
            />
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <PreviewModule
          description="Recent evidence behind the dashboard, including status and execution completion."
          href="/restricted/runs"
          title="Recent runs"
        >
          {recentRuns.length > 0 ? (
            <div className="grid gap-3">
              {recentRuns.map((run) => (
                <div
                  key={run.runBatchId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-black/8 bg-[var(--surface)] px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-black">{formatStatus(run.runType)}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {run.completedAt
                        ? `Completed ${formatRelativeTime(run.completedAt)}`
                        : `Started ${formatRelativeTime(run.startedAt)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusChip label={formatStatus(run.status)} tone="default" />
                    <p className="mt-2 text-sm text-black/55">
                      {run.completedExecutions}/{run.totalExecutions} complete
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyStatePanel
              description="No completed or partial runs are available yet, so the overview is still operating from setup status rather than execution evidence."
              eyebrow="Runs"
              title="No completed runs yet"
            />
          )}
        </PreviewModule>

        <PreviewModule
          description="Which models currently give the client the best chance of appearing."
          href="/restricted/models"
          title="Top models"
        >
          <DashboardTable
            columns={["Model", "Visibility", "Mention rate", "Pressure"]}
            emptyState={
              <EmptyStatePanel
                description="Model-level visibility appears after the first completed or partial run is materialized."
                eyebrow="Models"
                title="No model visibility yet"
              />
            }
            rows={strongestModels.map((model) => ({
              key: model.aiModelId,
              cells: [
                <div key="model">
                  <p className="font-medium text-black">{model.modelName}</p>
                </div>,
                <span key="visibility">{formatScore(model.visibilityScore)}</span>,
                <span key="mention-rate">{formatPercent(model.mentionRate)}</span>,
                <span key="pressure">{formatPercent(model.competitorPressure)}</span>,
              ],
            }))}
          />
        </PreviewModule>

        <PreviewModule
          description="Weak clusters should be reviewed before strong ones because they reveal prompt-intent gaps."
          href="/restricted/clusters"
          title="Weak clusters"
        >
          <DashboardTable
            columns={["Cluster", "Status", "Visibility", "Pressure"]}
            emptyState={
              <EmptyStatePanel
                description="Cluster-level visibility will appear once there is at least one completed or partial run to analyze."
                eyebrow="Clusters"
                title="No cluster analysis yet"
              />
            }
            rows={weakestClusters.map((cluster) => ({
              key: cluster.clusterName,
              cells: [
                <div key="cluster">
                  <p className="font-medium text-black">{cluster.clusterName}</p>
                </div>,
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
                <span key="visibility">{formatScore(cluster.visibilityScore)}</span>,
                <span key="pressure">{formatPercent(cluster.competitorPressure)}</span>,
              ],
            }))}
          />
        </PreviewModule>

        <PreviewModule
          description="The competitors currently occupying the answer set most often."
          href="/restricted/competitors"
          title="Top competitors"
        >
          <DashboardTable
            columns={["Competitor", "Wins", "Share of voice", "Delta"]}
            emptyState={
              <EmptyStatePanel
                description="Competitor metrics only appear when a run produces comparable answer-set mentions."
                eyebrow="Competitors"
                title="No competitor metrics yet"
              />
            }
            rows={threatenedBy.map((competitor) => ({
              key: competitor.competitorName,
              cells: [
                <div key="competitor">
                  <p className="font-medium text-black">{competitor.competitorName}</p>
                </div>,
                <span key="wins">{competitor.winsAgainstClientCount}</span>,
                <span key="sov">{formatPercent(competitor.shareOfVoice)}</span>,
                <span key="delta">{formatScore(competitor.clientVsCompetitorDelta)}</span>,
              ],
            }))}
          />
        </PreviewModule>
      </section>

      {promptContext && promptContext.prompt_generation_blockers.length > 0 ? (
        <SurfaceCard>
          <SectionHeading
            description="Operational blockers that currently limit prompt generation or reduce confidence in the dashboard."
            eyebrow="Blockers"
            title="Current setup risks"
          />
          <div className="mt-6 grid gap-3">
            {promptContext.prompt_generation_blockers.map((blocker) => (
              <div
                key={blocker}
                className="rounded-[1.35rem] border border-amber-800/12 bg-amber-800/[0.07] p-4 text-sm leading-7 text-amber-950"
              >
                {blocker}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/18 hover:text-black"
              href="/restricted/data-health"
            >
              Open data health
            </Link>
          </div>
        </SurfaceCard>
      ) : null}
      </DashboardPage>
      <ProjectOnboardingProgressModal
        coreApiBaseUrl={coreApiBaseUrl}
        onboardingFlag={params.onboarding ?? null}
        onboardingProjectId={params.projectId ?? null}
        projectId={state.project.id}
      />
    </>
  );
}
