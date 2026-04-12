import {
  getCoreProjectVisibilityModels,
  getCoreProjectVisibilitySummary,
} from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import { sortModelsStrongFirst, sortModelsWeakFirst } from "../_components/dashboard-helpers";
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
  title: "Models | Qoteon",
  description: "Model-by-model visibility comparison for Qoteon.",
};

export default async function ModelsPage() {
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Model comparison becomes available after onboarding creates the project."
          eyebrow="Models"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const [modelsResult, summaryResult] = await Promise.allSettled([
    getCoreProjectVisibilityModels(state.project.id, {
      sortBy: "visibilityScore",
      sortDirection: "asc",
    }),
    getCoreProjectVisibilitySummary(state.project.id),
  ]);

  const models = modelsResult.status === "fulfilled" ? modelsResult.value : null;
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
  const errors = [
    modelsResult.status === "rejected"
      ? "Model comparison data could not be loaded from Core."
      : null,
    summaryResult.status === "rejected"
      ? "Model coverage summary could not be loaded from Core."
      : null,
  ].filter(Boolean) as string[];

  const orderedModels = sortModelsWeakFirst(models?.items ?? []);
  const bestModel = sortModelsStrongFirst(models?.items ?? [])[0] ?? null;
  const worstModel = orderedModels[0] ?? null;

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="Model performance shows where the client is visible or absent across different answer generators. Weak models matter because they reveal where the brand disappears even when prompt intent is relevant."
        eyebrow="Models"
        title="Which models are favorable for the client, and which are not?"
      />

      {errors.length > 0 ? (
        <ErrorStatePanel
          description={errors.join(" ")}
          title="Some model data is temporarily unavailable."
        />
      ) : null}

      <SurfaceCard>
        <SectionHeading
          description="Best and worst performers, plus how much of the current model set includes the client at least once."
          eyebrow="Summary"
          title="Model summary"
        />

        <div className="mt-7">
          <SummaryStrip
            items={[
              {
                label: "Best model",
                value: bestModel?.modelName ?? "Not available",
                detail: bestModel
                  ? `Visibility ${formatScore(bestModel.visibilityScore)}`
                  : "No model-level run data is available yet.",
                tone: "positive",
              },
              {
                label: "Worst model",
                value: worstModel?.modelName ?? "Not available",
                detail: worstModel
                  ? `Pressure ${formatPercent(worstModel.competitorPressure)}`
                  : "No model-level run data is available yet.",
                tone: "negative",
              },
              {
                label: "Model coverage rate",
                value: summary
                  ? formatPercent(summary.modelCoverage.coverageRate)
                  : "Not available",
                detail: summary
                  ? `${summary.modelCoverage.modelsWithBrandMention}/${summary.modelCoverage.totalModels} models mention the client.`
                  : "Coverage is unavailable until the summary route succeeds.",
                tone: "info",
              },
            ]}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="Rows are ordered from weaker to stronger so the page surfaces model risk before model comfort."
          eyebrow="Breakdown"
          title="Model comparison"
        />

        <div className="mt-7">
          <DashboardTable
            columns={[
              "Model",
              "Mention rate",
              "Avg position",
              "Share of voice",
              "Competitor pressure",
              "Visibility",
              "Delta",
            ]}
            emptyState={
              <EmptyStatePanel
                description="No model comparison rows are available yet. This usually means there are no completed or partial runs for the current project."
                eyebrow="Models"
                title="No model visibility yet"
              />
            }
            rows={orderedModels.map((model) => ({
              key: model.aiModelId,
              cells: [
                <div key="model">
                  <p className="font-medium text-black">{model.modelName}</p>
                  <p className="mt-1 text-xs text-black/45">
                    {model.totalExecutions} executions
                  </p>
                </div>,
                <span key="mention-rate">{formatPercent(model.mentionRate)}</span>,
                <span key="avg-position">{formatScore(model.avgPosition, { decimals: 2 })}</span>,
                <span key="share-of-voice">{formatPercent(model.shareOfVoice)}</span>,
                <span key="pressure">{formatPercent(model.competitorPressure)}</span>,
                <span key="visibility">{formatScore(model.visibilityScore)}</span>,
                model.trend ? (
                  <StatusChip
                    key="delta"
                    label={formatTrendDelta(
                      model.trend.overallDirection,
                      model.trend.visibilityScoreDelta,
                      "score",
                    )}
                    tone={
                      model.trend.overallDirection === "up"
                        ? "positive"
                        : model.trend.overallDirection === "down"
                          ? "negative"
                          : "muted"
                    }
                  />
                ) : (
                  <span key="delta" className="text-black/45">
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
