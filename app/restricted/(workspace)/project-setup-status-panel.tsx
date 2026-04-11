import Link from "next/link";

import type {
  ProjectSetupPhase,
  ProjectSetupStatus,
  ProjectSetupStepStatus,
} from "@/utils/core/project-setup-status";

import { ProjectSetupAutoRefresh } from "./project-setup-auto-refresh";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getPhaseToneClasses(phase: ProjectSetupPhase) {
  switch (phase) {
    case "ready_to_run":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-900";
    case "crawl_failed":
      return "border-rose-500/20 bg-rose-500/10 text-rose-800";
    case "status_unavailable":
      return "border-amber-500/20 bg-amber-500/10 text-amber-900";
    default:
      return "border-sky-500/20 bg-sky-500/10 text-sky-900";
  }
}

function getStepToneClasses(status: ProjectSetupStepStatus) {
  switch (status) {
    case "complete":
      return "border-emerald-500/18 bg-emerald-500/8 text-emerald-900";
    case "current":
      return "border-sky-500/18 bg-sky-500/8 text-sky-900";
    case "blocked":
      return "border-rose-500/18 bg-rose-500/8 text-rose-800";
    case "upcoming":
      return "border-black/8 bg-[var(--surface)] text-black/78";
    default:
      return "border-black/8 bg-[var(--surface)] text-black/78";
  }
}

export function ProjectSetupStatusPanel({
  status,
}: {
  status: ProjectSetupStatus;
}) {
  return (
    <section className="grid gap-5">
      <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.18em] text-black/38">Project setup</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-4 py-2 text-sm font-medium ${getPhaseToneClasses(status.phase)}`}
              >
                {status.phaseLabel}
              </span>
              <p className="text-sm text-black/45">
                Updated from Core project status for {status.project.company_name}
              </p>
            </div>
            <h3 className="mt-5 font-serif text-3xl leading-tight tracking-[-0.04em] text-black sm:text-4xl">
              {status.title}
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/62">{status.summary}</p>
            <p className="mt-4 text-sm leading-7 text-black/72">
              Next step: <span className="font-medium text-black">{status.nextAction}</span>
            </p>
          </div>

          <ProjectSetupAutoRefresh
            intervalMs={status.refreshIntervalMs}
            shouldPoll={status.shouldPoll}
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {status.steps.map((step) => (
            <div
              key={step.key}
              className={`rounded-[1.5rem] border p-5 ${getStepToneClasses(step.status)}`}
            >
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">{step.label}</p>
              <p className="mt-3 text-sm leading-7">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
            <p className="text-sm text-black/45">Client crawl status</p>
            <p className="mt-3 text-lg font-medium text-black">
              {status.promptContext
                ? formatStatus(status.promptContext.client_website_crawl_status)
                : "Unavailable"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
            <p className="text-sm text-black/45">Latest crawl run</p>
            <p className="mt-3 text-lg font-medium text-black">
              {status.latestCrawlRun ? formatStatus(status.latestCrawlRun.status) : "Not started"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
            <p className="text-sm text-black/45">Prompts visible in Core</p>
            <p className="mt-3 text-lg font-medium text-black">
              {status.promptCount} total
            </p>
            <p className="mt-2 text-sm text-black/52">{status.activePromptCount} active</p>
          </div>
          <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
            <p className="text-sm text-black/45">Last prompt update</p>
            <p className="mt-3 text-base leading-7 text-black/72">
              {formatDate(status.latestPromptUpdatedAt)}
            </p>
          </div>
        </div>

        {status.recentCrawlRuns.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.18em] text-black/38">Recent crawl runs</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {status.recentCrawlRuns.map((crawlRun) => (
                <div
                  key={crawlRun.id}
                  className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5"
                >
                  <p className="text-sm text-black/45">{formatStatus(crawlRun.status)}</p>
                  <p className="mt-3 font-medium text-black">
                    {formatStatus(crawlRun.trigger_type)} crawl
                  </p>
                  <p className="mt-2 text-sm leading-7 text-black/62">
                    {crawlRun.pages_stored} pages stored
                  </p>
                  <p className="mt-2 text-sm leading-7 text-black/62">
                    Started {formatDate(crawlRun.started_at ?? crawlRun.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {status.warnings.length > 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-amber-900">Status warnings</p>
            <div className="mt-3 grid gap-2">
              {status.warnings.map((warning) => (
                <p key={warning} className="text-sm leading-7 text-amber-950">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
            href="/restricted/prompts"
          >
            View prompts
          </Link>
          <Link
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
            href="/restricted/competitors"
          >
            View competitors
          </Link>
        </div>
      </article>
    </section>
  );
}
