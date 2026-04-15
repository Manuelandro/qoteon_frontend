import {
  getCoreProjectOverview,
  getCoreProjectPromptContext,
  listCoreProjectCrawlRuns,
} from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import {
  formatDateTime,
  formatInteger,
  formatStatus,
} from "../_components/dashboard-format";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardTable,
  EmptyStatePanel,
  ErrorStatePanel,
  LabeledValueList,
  SectionHeading,
  StatusChip,
  SurfaceCard,
  SummaryStrip,
} from "../_components/dashboard-ui";

export const metadata = {
  title: "Data Health | Qoteon",
  description: "Prompt generation and crawl health for Qoteon.",
};

function buildInterpretationGuidance(input: {
  hasRuns: boolean;
  promptReady: boolean;
  crawlStatus: "pending" | "retrying" | "passed" | "not_passed";
}) {
  const guidance: string[] = [];

  if (input.crawlStatus === "not_passed") {
    guidance.push(
      "Client crawl did not produce usable data. Visibility metrics may be incomplete until the client site crawl succeeds.",
    );
  }

  if (!input.hasRuns) {
    guidance.push(
      "No runs exist yet, so execution-backed visibility analysis is not available.",
    );
  }

  if (!input.promptReady) {
    guidance.push(
      "Crawl-backed website intelligence is still being assembled. Prompt generation now runs separately, but AEO analysis and crawl diagnostics may still be incomplete.",
    );
  }

  if (guidance.length === 0) {
    guidance.push(
      "Current crawl and prompt-generation signals do not show a major interpretation blocker.",
    );
  }

  return guidance;
}

export default async function DataHealthPage() {
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Data-health diagnostics become available after onboarding creates the project."
          eyebrow="Data health"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const [promptContextResult, crawlRunsResult, overviewResult] = await Promise.allSettled([
    getCoreProjectPromptContext(state.project.id),
    listCoreProjectCrawlRuns(state.project.id, {
      limit: 10,
    }),
    getCoreProjectOverview(state.project.id),
  ]);

  const promptContext =
    promptContextResult.status === "fulfilled" ? promptContextResult.value : null;
  const crawlRuns = crawlRunsResult.status === "fulfilled" ? crawlRunsResult.value : null;
  const overview = overviewResult.status === "fulfilled" ? overviewResult.value : null;
  const errors = [
    promptContextResult.status === "rejected"
      ? "Website-intelligence diagnostics could not be loaded from Core."
      : null,
    crawlRunsResult.status === "rejected"
      ? "Recent crawl runs could not be loaded from Core."
      : null,
    overviewResult.status === "rejected"
      ? "Latest run context could not be loaded from Core."
      : null,
  ].filter(Boolean) as string[];

  if (!promptContext) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="This page explains whether the dashboard is operationally trustworthy."
          eyebrow="Data health"
          title="Can the current dashboard reads be trusted?"
        />
        <ErrorStatePanel
          description={errors.join(" ") || "Website-intelligence diagnostics are unavailable."}
          title="Data-health diagnostics are temporarily unavailable."
        />
      </DashboardPage>
    );
  }

  const guidance = buildInterpretationGuidance({
    hasRuns: Boolean(overview?.latestRun),
    promptReady: promptContext.is_ready_for_prompt_generation,
    crawlStatus: promptContext.client_website_crawl_status,
  });

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="This page is the trust layer for the dashboard. It explains whether prompt generation is usable, whether client crawl data is usable, and what those states mean operationally."
        eyebrow="Data health"
        title="Can the current dashboard reads be trusted?"
      />

      {errors.length > 0 ? (
        <ErrorStatePanel
          description={errors.join(" ")}
          title="Some diagnostic data is temporarily unavailable."
        />
      ) : null}

      <SurfaceCard>
        <SectionHeading
          description="Website-intelligence readiness and the current client crawl outcome."
          eyebrow="Setup readiness"
          title="Readiness status"
        />

        <div className="mt-7">
          <SummaryStrip
            items={[
              {
                label: "Website intelligence",
                value: promptContext.is_ready_for_prompt_generation ? "Ready" : "Building",
                detail: promptContext.is_ready_for_prompt_generation
                  ? "Crawl-backed website intelligence is ready."
                  : "Crawl-based blockers are still active for website intelligence.",
                tone: promptContext.is_ready_for_prompt_generation ? "positive" : "warning",
              },
              {
                label: "Client crawl status",
                value: formatStatus(promptContext.client_website_crawl_status),
                detail: promptContext.client_website_crawl_message ?? "Status from Source Intelligence.",
                tone:
                  promptContext.client_website_crawl_status === "passed"
                    ? "positive"
                    : promptContext.client_website_crawl_status === "not_passed"
                      ? "negative"
                      : "warning",
              },
              {
                label: "Website blockers",
                value: String(promptContext.prompt_generation_blockers.length),
                detail: "Active crawl-analysis blockers reported by Source Intelligence.",
                tone:
                  promptContext.prompt_generation_blockers.length > 0
                    ? "warning"
                    : "info",
              },
            ]}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="Crawl attempts, last successful crawl, and the available page coverage across client and competitor targets."
          eyebrow="Crawl health"
          title="Coverage and attempts"
        />

        <div className="mt-7">
          <LabeledValueList
            items={[
              {
                label: "Attempts made",
                value: `${promptContext.client_website_crawl_attempts_made}/${promptContext.client_website_crawl_max_attempts}`,
              },
              {
                label: "Last successful crawl",
                value: formatDateTime(promptContext.last_successful_crawl_at),
              },
              {
                label: "Active targets",
                value: formatInteger(promptContext.crawl_coverage.active_target_count),
              },
              {
                label: "Successful targets",
                value: formatInteger(promptContext.crawl_coverage.successful_target_count),
              },
              {
                label: "Total targets",
                value: formatInteger(promptContext.crawl_coverage.total_targets),
              },
              {
                label: "Total pages",
                value: formatInteger(promptContext.crawl_coverage.total_pages),
              },
              {
                label: "Client pages",
                value: formatInteger(promptContext.crawl_coverage.client_pages),
              },
              {
                label: "Competitor pages",
                value: formatInteger(promptContext.crawl_coverage.competitor_pages),
              },
            ]}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="When crawl-analysis blockers exist, they should be explicit rather than hidden behind vague health labels."
          eyebrow="Blockers"
          title="Website intelligence blockers"
        />

        <div className="mt-7 grid gap-3">
          {promptContext.prompt_generation_blockers.length > 0 ? (
            promptContext.prompt_generation_blockers.map((blocker) => (
              <div
                key={blocker}
                className="rounded-[1.35rem] border border-amber-800/12 bg-amber-800/[0.07] p-4 text-sm leading-7 text-amber-950"
              >
                {blocker}
              </div>
            ))
          ) : (
            <EmptyStatePanel
              description="No crawl-analysis blockers are active right now."
              eyebrow="Blockers"
              title="Website intelligence is not blocked"
            />
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="Recent crawl activity across the current project."
          eyebrow="Recent crawl runs"
          title="Crawl run history"
        />

        <div className="mt-7">
          <DashboardTable
            columns={[
              "Status",
              "Trigger",
              "Scope",
              "Pages stored",
              "Started",
              "Completed",
            ]}
            emptyState={
              <EmptyStatePanel
                description="No crawl runs are available yet."
                eyebrow="Crawls"
                title="No crawl activity yet"
              />
            }
            rows={(crawlRuns ?? []).map((crawlRun) => ({
              key: crawlRun.id,
              cells: [
                <StatusChip
                  key="status"
                  label={formatStatus(crawlRun.status)}
                  tone={
                    crawlRun.status === "completed"
                      ? "positive"
                      : crawlRun.status === "failed"
                        ? "negative"
                        : crawlRun.status === "partial"
                          ? "warning"
                          : "info"
                  }
                />,
                <span key="trigger">{formatStatus(crawlRun.trigger_type)}</span>,
                <span key="scope">{formatStatus(crawlRun.scope_type)}</span>,
                <span key="pages-stored">{formatInteger(crawlRun.pages_stored)}</span>,
                <span key="started">{formatDateTime(crawlRun.started_at ?? crawlRun.created_at)}</span>,
                <span key="completed">{formatDateTime(crawlRun.completed_at)}</span>,
              ],
            }))}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="Plain-language reading guidance based on the current prompt-generation and crawl status."
          eyebrow="Interpretation guidance"
          title="What these states mean"
        />

        <div className="mt-7 grid gap-3">
          {guidance.map((item) => (
            <div
              key={item}
              className="rounded-[1.35rem] border border-black/8 bg-[var(--surface)] p-4 text-sm leading-7 text-black/72"
            >
              {item}
            </div>
          ))}
        </div>
      </SurfaceCard>
    </DashboardPage>
  );
}
