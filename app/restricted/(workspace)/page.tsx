import { ProjectSetupStatusPanel } from "./project-setup-status-panel";

import { buildProjectSetupStatus } from "@/utils/core/project-setup-status";
import { getWorkspaceState } from "@/utils/core/workspace";
import { getAuthenticatedUser } from "@/utils/supabase/server";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return `${Math.round(value * 100)}%`;
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export const metadata = {
  title: "Restricted area | Qoteon",
  description: "Private Qoteon area protected by Supabase authentication.",
};

export default async function RestrictedPage() {
  const [user, state] = await Promise.all([getAuthenticatedUser(), getWorkspaceState()]);

  if (!user || !state.project) {
    return null;
  }

  const provider = user.app_metadata.provider ?? "email";
  const latestKpis = state.overview?.latestKpis ?? null;
  const setupStatus = await buildProjectSetupStatus({
    project: state.project,
    promptContext: state.promptContext,
  });

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">
          Core-backed workspace
        </p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          The restricted area now reflects the real Qoteon setup pipeline instead of
          assuming the project is already complete.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          Supabase Auth still owns login and the minimal local profile flag, but project
          setup status, crawl readiness, and prompt readiness now come from{" "}
          <code>qoteon_core_api</code>.
        </p>
      </section>

      <ProjectSetupStatusPanel status={setupStatus} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Project profile
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Company</p>
              <p className="mt-3 text-lg font-medium text-black">
                {state.project.company_name}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Project status</p>
              <p className="mt-3 text-lg font-medium text-black">
                {formatStatus(state.project.status)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Website</p>
              <p className="mt-3 break-all text-lg font-medium text-black">
                {state.project.domain}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Organization</p>
              <p className="mt-3 text-lg font-medium text-black">
                {state.organization?.name ?? "Not available"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Category</p>
              <p className="mt-3 text-lg font-medium text-black">
                {state.project.primary_category}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Target region</p>
              <p className="mt-3 text-lg font-medium text-black">
                {state.project.target_region}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Primary language</p>
              <p className="mt-3 text-lg font-medium text-black">
                {state.project.target_language}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Auth provider</p>
              <p className="mt-3 text-lg font-medium capitalize text-black">{provider}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">Workspace health</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Mention rate</p>
              <p className="mt-3 text-lg font-medium text-black">
                {formatPercent(latestKpis?.mentionRate)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Share of voice</p>
              <p className="mt-3 text-lg font-medium text-black">
                {formatPercent(latestKpis?.shareOfVoice)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Prompt coverage</p>
              <p className="mt-3 text-lg font-medium text-black">
                {formatPercent(latestKpis?.promptCoverage)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Visibility score</p>
              <p className="mt-3 text-lg font-medium text-black">
                {latestKpis?.visibilityScore ?? "Not available"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
            <p className="text-sm text-black/45">Latest run</p>
            <p className="mt-3 text-lg font-medium text-black">
              {state.overview?.latestRun
                ? formatStatus(state.overview.latestRun.status)
                : "No runs available yet"}
            </p>
            <p className="mt-3 text-sm leading-7 text-black/62">
              {state.overview?.latestRun
                ? `${state.overview.latestRun.completedExecutions}/${state.overview.latestRun.totalExecutions} executions completed`
                : "The first baseline run becomes the next workflow step after setup is ready."}
            </p>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
            <p className="text-sm text-black/45">Competitors tracked in Core</p>
            <p className="mt-3 text-lg font-medium text-black">{state.competitors.length}</p>
            <p className="mt-3 text-sm leading-7 text-black/62">
              {state.competitors.length > 0
                ? `${state.competitors.length} competitor domain${state.competitors.length === 1 ? "" : "s"} are part of this project setup.`
                : "No Core competitors are attached to this project yet."}
            </p>
            <p className="mt-3 text-sm leading-7 text-black/62">
              Last project update: {formatDate(state.project.updated_at)}
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
