import type {
  CoreDashboardClusterComparisonRow,
  CoreDashboardCompetitorComparisonRow,
  CoreDashboardModelComparisonRow,
  CoreDashboardRunBatchProgress,
  CoreDashboardTimeSeriesPoint,
  CoreDashboardTrendDirection,
  CoreRunBatch,
  CoreRunBatchProgress,
} from "@/utils/core/client";

export function sortModelsWeakFirst(items: CoreDashboardModelComparisonRow[]) {
  return [...items].sort(
    (left, right) =>
      left.visibilityScore - right.visibilityScore ||
      right.competitorPressure - left.competitorPressure,
  );
}

export function sortModelsStrongFirst(items: CoreDashboardModelComparisonRow[]) {
  return [...items].sort(
    (left, right) =>
      right.visibilityScore - left.visibilityScore ||
      left.competitorPressure - right.competitorPressure,
  );
}

export function sortClustersWeakFirst(items: CoreDashboardClusterComparisonRow[]) {
  return [...items].sort(
    (left, right) =>
      left.visibilityScore - right.visibilityScore ||
      right.competitorPressure - left.competitorPressure,
  );
}

export function sortCompetitorsThreatFirst(items: CoreDashboardCompetitorComparisonRow[]) {
  return [...items].sort(
    (left, right) =>
      right.winsAgainstClientCount - left.winsAgainstClientCount ||
      left.clientVsCompetitorDelta - right.clientVsCompetitorDelta ||
      right.totalMentions - left.totalMentions,
  );
}

export function sortRunsNewestFirst(items: CoreRunBatch[]) {
  return [...items].sort(
    (left, right) =>
      toTimestamp(right.completed_at ?? right.started_at ?? right.created_at) -
      toTimestamp(left.completed_at ?? left.started_at ?? left.created_at),
  );
}

export function pickPreferredRun(items: CoreRunBatch[]) {
  const ordered = sortRunsNewestFirst(items);
  return (
    ordered.find((item) => item.status === "completed" || item.status === "partial") ??
    ordered[0] ??
    null
  );
}

export function mergeRunBatchWithProgress(
  runBatch: CoreRunBatch,
  progress: CoreRunBatchProgress | null,
): CoreDashboardRunBatchProgress & { createdAt: string } {
  const fallbackCompletedExecutions =
    progress?.completed_executions ??
    (runBatch.status === "completed" ? runBatch.execution_count : 0);
  const fallbackFailedExecutions =
    progress?.failed_executions ??
    (runBatch.status === "failed" ? runBatch.execution_count : 0);

  return {
    runBatchId: runBatch.id,
    runType: runBatch.run_type,
    status: progress?.status ?? runBatch.status,
    startedAt: runBatch.started_at,
    completedAt: runBatch.completed_at,
    totalExecutions: progress?.total_executions ?? runBatch.execution_count,
    completedExecutions: fallbackCompletedExecutions,
    failedExecutions: fallbackFailedExecutions,
    createdAt: runBatch.created_at,
  };
}

export function latestMetricPoint(points: CoreDashboardTimeSeriesPoint[]) {
  return [...points]
    .filter((point) => point.value !== null)
    .sort((left, right) => toTimestamp(right.observedAt) - toTimestamp(left.observedAt))[0] ?? null;
}

export function weakestClusters(items: CoreDashboardClusterComparisonRow[], limit: number) {
  return sortClustersWeakFirst(items).slice(0, limit);
}

export function overallDirectionTone(direction: CoreDashboardTrendDirection) {
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

function toTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
