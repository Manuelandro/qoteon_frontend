import "server-only";

import type {
  CoreProject,
  CorePromptContext,
  CorePromptRecord,
  CoreSourceIntelligenceCrawlRun,
} from "@/utils/core/client";
import {
  listCoreProjectCrawlRuns,
  listCoreProjectPrompts,
} from "@/utils/core/client";

const DEFAULT_REFRESH_INTERVAL_MS = 15_000;

export type ProjectSetupPhase =
  | "project_created"
  | "crawl_in_progress"
  | "prompt_context_pending"
  | "prompt_context_ready"
  | "crawl_failed"
  | "ready_to_run"
  | "status_unavailable";

export type ProjectSetupStepStatus = "complete" | "current" | "upcoming" | "blocked";

export type ProjectSetupStep = {
  description: string;
  key: "project_created" | "crawl" | "prompt_context" | "prompts";
  label: string;
  status: ProjectSetupStepStatus;
};

export type ProjectSetupStatus = {
  activePromptCount: number;
  latestCrawlRun: CoreSourceIntelligenceCrawlRun | null;
  latestPromptUpdatedAt: string | null;
  nextAction: string;
  phase: ProjectSetupPhase;
  phaseLabel: string;
  promptCount: number;
  promptContext: CorePromptContext | null;
  project: CoreProject;
  recentCrawlRuns: CoreSourceIntelligenceCrawlRun[];
  refreshIntervalMs: number | null;
  shouldPoll: boolean;
  steps: ProjectSetupStep[];
  summary: string;
  title: string;
  warnings: string[];
};

type BuildProjectSetupStatusInput = {
  project: CoreProject;
  promptContext?: CorePromptContext | null;
};

export async function buildProjectSetupStatus(
  input: BuildProjectSetupStatusInput,
): Promise<ProjectSetupStatus> {
  const crawlRunsResult = await readCrawlRuns(input.project.id);
  const promptsResult = await readPrompts(input.project.id);
  const promptContext = input.promptContext ?? null;
  const crawlRuns = sortCrawlRuns(crawlRunsResult.crawlRuns);
  const prompts = sortPrompts(promptsResult.prompts);
  const latestCrawlRun = crawlRuns[0] ?? null;
  const promptCount = prompts.length;
  const activePromptCount = prompts.filter((prompt) => prompt.is_active).length;
  const latestPromptUpdatedAt =
    prompts.find((prompt) => Boolean(prompt.updated_at || prompt.created_at))?.updated_at ??
    prompts.find((prompt) => Boolean(prompt.updated_at || prompt.created_at))?.created_at ??
    null;
  const warnings = [...crawlRunsResult.warnings, ...promptsResult.warnings];
  const phase = resolveProjectSetupPhase({
    crawlRuns,
    promptContext,
    promptCount,
    warnings,
  });

  return {
    activePromptCount,
    latestCrawlRun,
    latestPromptUpdatedAt,
    nextAction: getNextAction(phase),
    phase,
    phaseLabel: getPhaseLabel(phase),
    promptCount,
    promptContext,
    project: input.project,
    recentCrawlRuns: crawlRuns.slice(0, 3),
    refreshIntervalMs: isTerminalPhase(phase) ? null : DEFAULT_REFRESH_INTERVAL_MS,
    shouldPoll: !isTerminalPhase(phase),
    steps: buildSteps({
      activePromptCount,
      crawlRuns,
      phase,
      promptContext,
      promptCount,
    }),
    summary: getSummary({
      activePromptCount,
      crawlRuns,
      phase,
      promptContext,
      promptCount,
    }),
    title: getTitle(phase),
    warnings,
  };
}

async function readCrawlRuns(projectId: string) {
  try {
    const crawlRuns = await listCoreProjectCrawlRuns(projectId, {
      limit: 10,
    });

    return {
      crawlRuns,
      warnings: [] as string[],
    };
  } catch (error) {
    return {
      crawlRuns: [] as CoreSourceIntelligenceCrawlRun[],
      warnings: [getErrorMessage(error, "Unable to load crawl-run status from Core.")],
    };
  }
}

async function readPrompts(projectId: string) {
  try {
    const prompts = await listCoreProjectPrompts(projectId);

    return {
      prompts,
      warnings: [] as string[],
    };
  } catch (error) {
    return {
      prompts: [] as CorePromptRecord[],
      warnings: [getErrorMessage(error, "Unable to load generated prompts from Core.")],
    };
  }
}

function resolveProjectSetupPhase(input: {
  crawlRuns: CoreSourceIntelligenceCrawlRun[];
  promptContext: CorePromptContext | null;
  promptCount: number;
  warnings: string[];
}): ProjectSetupPhase {
  if (input.promptCount > 0) {
    return "ready_to_run";
  }

  if (input.promptContext?.client_website_crawl_status === "not_passed") {
    return "crawl_failed";
  }

  if (input.promptContext?.is_ready_for_prompt_generation) {
    return "prompt_context_ready";
  }

  if (input.crawlRuns.length === 0) {
    return input.warnings.length > 0 && input.promptContext === null
      ? "status_unavailable"
      : "project_created";
  }

  if (hasActiveCrawl(input.crawlRuns, input.promptContext)) {
    return "crawl_in_progress";
  }

  return "prompt_context_pending";
}

function buildSteps(input: {
  activePromptCount: number;
  crawlRuns: CoreSourceIntelligenceCrawlRun[];
  phase: ProjectSetupPhase;
  promptContext: CorePromptContext | null;
  promptCount: number;
}): ProjectSetupStep[] {
  const crawlStatus =
    input.phase === "crawl_failed"
      ? "blocked"
      : input.crawlRuns.length === 0
        ? "upcoming"
        : hasActiveCrawl(input.crawlRuns, input.promptContext)
          ? "current"
          : hasClientCrawlPassed(input.promptContext)
            ? "complete"
            : input.phase === "prompt_context_pending" || input.phase === "prompt_context_ready" || input.phase === "ready_to_run"
              ? "complete"
              : "upcoming";
  const promptContextStatus =
    input.phase === "crawl_failed"
      ? "blocked"
      : input.phase === "prompt_context_ready" || input.phase === "ready_to_run"
        ? "complete"
        : input.phase === "prompt_context_pending"
          ? "current"
          : "upcoming";
  const promptsStatus =
    input.phase === "crawl_failed"
      ? "blocked"
      : input.promptCount > 0 || input.activePromptCount > 0
        ? "complete"
        : input.phase === "prompt_context_ready"
          ? "current"
          : "upcoming";

  return [
    {
      description: "Core created the base project record and stored the initial ownership context.",
      key: "project_created",
      label: "Project created",
      status: "complete",
    },
    {
      description: getCrawlStepDescription(input.phase, input.promptContext, input.crawlRuns),
      key: "crawl",
      label: "Website crawl",
      status: crawlStatus,
    },
    {
      description: getPromptContextStepDescription(input.phase, input.promptContext),
      key: "prompt_context",
      label: "Prompt context",
      status: promptContextStatus,
    },
    {
      description: getPromptsStepDescription(input.promptCount, input.activePromptCount, input.phase),
      key: "prompts",
      label: "Prompts generated",
      status: promptsStatus,
    },
  ];
}

function getTitle(phase: ProjectSetupPhase) {
  switch (phase) {
    case "project_created":
      return "Project created in Core";
    case "crawl_in_progress":
      return "Crawl work is in progress";
    case "prompt_context_pending":
      return "Preparing prompt context";
    case "prompt_context_ready":
      return "Prompt context is ready";
    case "crawl_failed":
      return "Client website crawl needs attention";
    case "ready_to_run":
      return "Project setup is ready";
    case "status_unavailable":
      return "Project status is temporarily unavailable";
    default:
      return "Project setup status";
  }
}

function getPhaseLabel(phase: ProjectSetupPhase) {
  switch (phase) {
    case "project_created":
      return "Created";
    case "crawl_in_progress":
      return "Crawling";
    case "prompt_context_pending":
      return "Processing";
    case "prompt_context_ready":
      return "Generating prompts";
    case "crawl_failed":
      return "Blocked";
    case "ready_to_run":
      return "Ready";
    case "status_unavailable":
      return "Unavailable";
    default:
      return "Status";
  }
}

function getSummary(input: {
  activePromptCount: number;
  crawlRuns: CoreSourceIntelligenceCrawlRun[];
  phase: ProjectSetupPhase;
  promptContext: CorePromptContext | null;
  promptCount: number;
}) {
  switch (input.phase) {
    case "project_created":
      return "Core created the project. The asynchronous setup pipeline is starting now.";
    case "crawl_in_progress":
      return `Source Intelligence has ${input.crawlRuns.length} recorded crawl run${input.crawlRuns.length === 1 ? "" : "s"} and is still collecting website data.`;
    case "prompt_context_pending":
      return "Crawl work has started, but the prompt context is not ready yet.";
    case "prompt_context_ready":
      return "Source Intelligence marked the project ready for prompt generation. Prompt Library should create the first prompt set shortly.";
    case "crawl_failed":
      return input.promptContext?.client_website_crawl_message ??
        "The client website did not pass crawl readiness, so prompt generation is blocked.";
    case "ready_to_run":
      return `Core already exposes ${input.promptCount} generated prompt${input.promptCount === 1 ? "" : "s"}${input.activePromptCount > 0 ? `, with ${input.activePromptCount} active` : ""}, and the first baseline run should launch automatically shortly.`;
    case "status_unavailable":
      return "Core project setup exists, but the frontend could not fully resolve the current setup pipeline state.";
    default:
      return "Core is coordinating the project setup pipeline.";
  }
}

function getNextAction(phase: ProjectSetupPhase) {
  switch (phase) {
    case "project_created":
      return "Stay on this page while Qoteon queues the first crawl jobs.";
    case "crawl_in_progress":
      return "Wait while Qoteon crawls the client and competitor sites. The page will refresh automatically.";
    case "prompt_context_pending":
      return "Give the pipeline a little longer so Source Intelligence can finalize the prompt context.";
    case "prompt_context_ready":
      return "Prompt generation should finish shortly, and Qoteon will launch the first baseline run automatically.";
    case "crawl_failed":
      return "Check that the client website is reachable without login walls or aggressive bot blocking, then trigger another crawl when retry UI is available.";
    case "ready_to_run":
      return "Qoteon should launch the first baseline run automatically now. Stay on the workspace while execution-backed analytics appear.";
    case "status_unavailable":
      return "Refresh the page to retry the Core status reads.";
    default:
      return "Check the project setup pipeline again in a moment.";
  }
}

function getCrawlStepDescription(
  phase: ProjectSetupPhase,
  promptContext: CorePromptContext | null,
  crawlRuns: CoreSourceIntelligenceCrawlRun[],
) {
  if (phase === "crawl_failed") {
    return promptContext?.client_website_crawl_message ??
      "The client site did not produce usable crawl data.";
  }

  if (crawlRuns.length === 0) {
    return "Core has created the project, but no crawl run has been recorded yet.";
  }

  if (hasActiveCrawl(crawlRuns, promptContext)) {
    return "Source Intelligence has queued or running crawl work for this project.";
  }

  if (hasClientCrawlPassed(promptContext)) {
    return "The client website passed crawl readiness.";
  }

  return "Crawl runs exist, but readiness is still being resolved.";
}

function getPromptContextStepDescription(
  phase: ProjectSetupPhase,
  promptContext: CorePromptContext | null,
) {
  if (phase === "crawl_failed") {
    return "Prompt generation stays blocked until the client site passes crawl readiness.";
  }

  if (phase === "prompt_context_ready" || phase === "ready_to_run") {
    return "Source Intelligence says the prompt context is ready for Prompt Library.";
  }

  if (!promptContext) {
    return "Prompt-context status is not available yet.";
  }

  if (promptContext.prompt_generation_blockers.length > 0) {
    return `Current blockers: ${promptContext.prompt_generation_blockers.join(", ")}.`;
  }

  return "Qoteon is still assembling the prompt context from crawl data.";
}

function getPromptsStepDescription(
  promptCount: number,
  activePromptCount: number,
  phase: ProjectSetupPhase,
) {
  if (promptCount > 0) {
    return `${promptCount} prompt${promptCount === 1 ? "" : "s"} generated${activePromptCount > 0 ? `, ${activePromptCount} active` : ""}.`;
  }

  if (phase === "prompt_context_ready") {
    return "Prompt Library is expected to generate the first prompt set next.";
  }

  if (phase === "crawl_failed") {
    return "Prompt generation is blocked until the client crawl passes.";
  }

  return "No generated prompts are visible in Core yet.";
}

function hasActiveCrawl(
  crawlRuns: CoreSourceIntelligenceCrawlRun[],
  promptContext: CorePromptContext | null,
) {
  if (crawlRuns.some((run) => run.status === "queued" || run.status === "running")) {
    return true;
  }

  return (
    promptContext?.client_website_crawl_status === "pending" ||
    promptContext?.client_website_crawl_status === "retrying"
  );
}

function hasClientCrawlPassed(promptContext: CorePromptContext | null) {
  return promptContext?.client_website_crawl_status === "passed";
}

function isTerminalPhase(phase: ProjectSetupPhase) {
  return phase === "crawl_failed" || phase === "ready_to_run" || phase === "status_unavailable";
}

function sortCrawlRuns(crawlRuns: CoreSourceIntelligenceCrawlRun[]) {
  return [...crawlRuns].sort((left, right) => getRunTimestamp(right) - getRunTimestamp(left));
}

function sortPrompts(prompts: CorePromptRecord[]) {
  return [...prompts].sort(
    (left, right) => getOptionalTimestamp(right.updated_at ?? right.created_at) - getOptionalTimestamp(left.updated_at ?? left.created_at),
  );
}

function getRunTimestamp(run: CoreSourceIntelligenceCrawlRun) {
  return getOptionalTimestamp(run.created_at ?? run.updated_at ?? run.started_at ?? run.completed_at);
}

function getOptionalTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
