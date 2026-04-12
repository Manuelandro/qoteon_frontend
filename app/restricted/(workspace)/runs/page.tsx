import {
  getCoreRunBatchProgress,
  getCoreRunBatchResults,
  listCoreProjectRunBatches,
} from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import {
  mergeRunBatchWithProgress,
  pickPreferredRun,
  sortClustersWeakFirst,
  sortCompetitorsThreatFirst,
  sortModelsStrongFirst,
  sortRunsNewestFirst,
} from "../_components/dashboard-helpers";
import {
  formatDateTime,
  formatPercent,
  formatRunType,
  formatScore,
} from "../_components/dashboard-format";
import {
  DashboardPage,
  DashboardPageHeader,
  EmptyStatePanel,
  ErrorStatePanel,
  LabeledValueList,
  RunListItem,
  SectionHeading,
  SurfaceCard,
  SummaryStrip,
} from "../_components/dashboard-ui";

type RunsPageProps = {
  searchParams: Promise<{
    run?: string | string[];
  }>;
};

export const metadata = {
  title: "Runs | Qoteon",
  description: "Run evidence and auditability for Qoteon.",
};

function readSelectedRunId(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

export default async function RunsPage({ searchParams }: RunsPageProps) {
  const { run } = await searchParams;
  const selectedRunId = readSelectedRunId(run);
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Run evidence becomes available after onboarding creates the project."
          eyebrow="Runs"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const runBatches = await listCoreProjectRunBatches(state.project.id, {
    limit: 12,
  }).catch(() => null);

  if (!runBatches) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Runs are the evidence layer behind every dashboard interpretation."
          eyebrow="Runs"
          title="Which runs support the current dashboard reads?"
        />
        <ErrorStatePanel
          description="Run batches could not be loaded from Core."
          title="Run history is temporarily unavailable."
        />
      </DashboardPage>
    );
  }

  const orderedRunBatches = sortRunsNewestFirst(runBatches);
  const defaultRun = pickPreferredRun(orderedRunBatches);
  const activeRun =
    orderedRunBatches.find((item) => item.id === selectedRunId) ?? defaultRun ?? null;

  const progressEntries = await Promise.all(
    orderedRunBatches.map(async (runBatch) => {
      const progress = await getCoreRunBatchProgress(runBatch.id).catch(() => null);

      return {
        runBatch,
        progress,
        merged: mergeRunBatchWithProgress(runBatch, progress),
      };
    }),
  );

  const activeRunResults = activeRun
    ? await getCoreRunBatchResults(activeRun.id).catch(() => null)
    : null;
  const strongestModels = sortModelsStrongFirst(activeRunResults?.modelSummary ?? []).slice(0, 4);
  const weakestClusters = sortClustersWeakFirst(activeRunResults?.clusterSummary ?? []).slice(0, 4);
  const threateningCompetitors = sortCompetitorsThreatFirst(
    activeRunResults?.competitorSummary ?? [],
  ).slice(0, 4);

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="This page is the audit layer for the dashboard. It shows which runs exist, what status they reached, and what the selected run actually says about visibility."
        eyebrow="Runs"
        title="Which runs back the current dashboard, and can we trust them?"
      />

      {orderedRunBatches.length === 0 ? (
        <SurfaceCard>
          <EmptyStatePanel
            description="No run batches exist yet. The project can still show setup and readiness state, but execution-backed visibility analysis is not available."
            eyebrow="Runs"
            title="No completed runs yet"
          />
        </SurfaceCard>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
          <SurfaceCard className="px-5 py-5">
            <SectionHeading
              description="Latest completed or partial run is selected by default."
              eyebrow="Run list"
              title="Available runs"
            />

            <div className="mt-6 grid gap-3">
              {progressEntries.map((entry) => (
                <RunListItem
                  key={entry.runBatch.id}
                  completedExecutions={
                    entry.progress?.completed_executions ?? entry.merged.completedExecutions
                  }
                  failedExecutions={
                    entry.progress?.failed_executions ?? entry.merged.failedExecutions
                  }
                  href={`/restricted/runs?run=${entry.runBatch.id}`}
                  isActive={activeRun?.id === entry.runBatch.id}
                  run={entry.merged}
                />
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            {activeRun ? (
              <>
                <SectionHeading
                  description="Selected run details and derived dashboard summary."
                  eyebrow="Selected run"
                  title={formatRunType(activeRun.run_type)}
                />

                <div className="mt-7">
                  <SummaryStrip
                    items={[
                      {
                        label: "Run status",
                        value: activeRun.status,
                        detail: `Started ${formatDateTime(activeRun.started_at)}.`,
                        tone:
                          activeRun.status === "completed"
                            ? "positive"
                            : activeRun.status === "partial"
                              ? "warning"
                              : activeRun.status === "failed"
                                ? "negative"
                                : "info",
                      },
                      {
                        label: "Executions",
                        value: String(
                          progressEntries.find((entry) => entry.runBatch.id === activeRun.id)
                            ?.merged.totalExecutions ?? activeRun.execution_count,
                        ),
                        detail: "Total prompt x model executions scheduled for this run.",
                        tone: "info",
                      },
                      {
                        label: "Completed at",
                        value: formatDateTime(activeRun.completed_at),
                        detail: "Completion timestamp when available.",
                        tone: "default",
                      },
                    ]}
                  />
                </div>

                {activeRunResults ? (
                  <>
                    <div className="mt-8">
                      <SectionHeading
                        description="Run-level KPI summary from the dashboard layer."
                        eyebrow="KPI summary"
                        title="What this run says"
                      />
                      <div className="mt-6">
                        <LabeledValueList
                          items={[
                            {
                              label: "Visibility score",
                              value: formatScore(activeRunResults.kpiSummary.visibilityScore),
                            },
                            {
                              label: "Mention rate",
                              value: formatPercent(activeRunResults.kpiSummary.mentionRate),
                            },
                            {
                              label: "Share of voice",
                              value: formatPercent(activeRunResults.kpiSummary.shareOfVoice),
                            },
                            {
                              label: "Prompt coverage",
                              value: formatPercent(activeRunResults.kpiSummary.promptCoverage),
                            },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="mt-8 grid gap-5 xl:grid-cols-3">
                      <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">
                          Model summary
                        </p>
                        <div className="mt-4 grid gap-3">
                          {strongestModels.length > 0 ? (
                            strongestModels.map((model) => (
                              <div
                                key={model.aiModelId}
                                className="rounded-[1.2rem] border border-black/8 bg-white/72 p-4"
                              >
                                <p className="font-medium text-black">{model.modelName}</p>
                                <p className="mt-2 text-sm text-black/58">
                                  Visibility {formatScore(model.visibilityScore)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm leading-7 text-black/58">
                              No model summary is available for this run.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">
                          Cluster summary
                        </p>
                        <div className="mt-4 grid gap-3">
                          {weakestClusters.length > 0 ? (
                            weakestClusters.map((cluster) => (
                              <div
                                key={cluster.clusterName}
                                className="rounded-[1.2rem] border border-black/8 bg-white/72 p-4"
                              >
                                <p className="font-medium text-black">{cluster.clusterName}</p>
                                <p className="mt-2 text-sm text-black/58">
                                  Visibility {formatScore(cluster.visibilityScore)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm leading-7 text-black/58">
                              No cluster summary is available for this run.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">
                          Competitor summary
                        </p>
                        <div className="mt-4 grid gap-3">
                          {threateningCompetitors.length > 0 ? (
                            threateningCompetitors.map((competitor) => (
                              <div
                                key={competitor.competitorName}
                                className="rounded-[1.2rem] border border-black/8 bg-white/72 p-4"
                              >
                                <p className="font-medium text-black">
                                  {competitor.competitorName}
                                </p>
                                <p className="mt-2 text-sm text-black/58">
                                  {competitor.winsAgainstClientCount} wins against client
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm leading-7 text-black/58">
                              No competitor summary is available for this run.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-8">
                    <ErrorStatePanel
                      description="The selected run does not currently expose a dashboard result summary. This is expected for queued or running runs, and it can also happen when materialization has not completed yet."
                      title="Run results are not available for this selection."
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyStatePanel
                description="No run batch is available to inspect yet."
                eyebrow="Selected run"
                title="Choose a run when one exists"
              />
            )}
          </SurfaceCard>
        </section>
      )}
    </DashboardPage>
  );
}
