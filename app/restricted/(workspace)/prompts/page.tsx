import Link from "next/link";
import type { ReactNode } from "react";

import type {
  CoreDashboardPromptVisibilityRow,
  CorePromptCapacitySummary,
  CorePromptLibraryItem,
} from "@/utils/core/client";
import {
  getCoreProjectPromptCapacity,
  getCoreProjectVisibilityPrompts,
  listCoreProjectPromptLibrary,
} from "@/utils/core/client";
import { getWorkspaceState } from "@/utils/core/workspace";

import { deletePromptAction, importPromptLibraryItemAction, updatePromptAction } from "./actions";
import {
  formatDateTime,
  formatInteger,
  formatPercent,
  formatRelativeTime,
} from "../_components/dashboard-format";
import {
  DashboardPage,
  DashboardPageHeader,
  EmptyStatePanel,
  ErrorStatePanel,
  SectionHeading,
  StatusChip,
  SurfaceCard,
  SummaryStrip,
} from "../_components/dashboard-ui";

type PromptsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    edit?: string | string[];
    delete?: string | string[];
    message?: string | string[];
    error?: string | string[];
  }>;
};

export const metadata = {
  title: "Prompts | Qoteon",
  description: "Prompt Analysis and Prompt Library for Qoteon.",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function readSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

function buildPromptsHref(input: {
  search?: string;
  edit?: string;
  deleteId?: string;
  message?: string;
  error?: string;
}) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set("q", input.search);
  }

  if (input.edit) {
    params.set("edit", input.edit);
  }

  if (input.deleteId) {
    params.set("delete", input.deleteId);
  }

  if (input.message) {
    params.set("message", input.message);
  }

  if (input.error) {
    params.set("error", input.error);
  }

  const query = params.toString();
  return query ? `/restricted/prompts?${query}` : "/restricted/prompts";
}

function formatPromptFacet(value: string | null | undefined, fallback: string) {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getCapacityTone(
  value: number | null | undefined,
  threshold: number,
): "default" | "positive" | "warning" | "negative" {
  if (value === null || value === undefined) {
    return "default";
  }

  if (value <= 0) {
    return "negative";
  }

  if (value <= threshold) {
    return "warning";
  }

  return "positive";
}

function getVisibilityTone(
  visibilityPercent: number | null,
): "default" | "positive" | "warning" | "negative" {
  if (visibilityPercent === null) {
    return "default";
  }

  if (visibilityPercent >= 0.6) {
    return "positive";
  }

  if (visibilityPercent >= 0.3) {
    return "warning";
  }

  return "negative";
}

function NotificationBanner({
  tone,
  message,
}: {
  tone: "positive" | "negative";
  message: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border px-5 py-4 text-sm",
        tone === "positive"
          ? "border-emerald-900/10 bg-emerald-900/[0.05] text-emerald-950"
          : "border-rose-900/10 bg-rose-900/[0.05] text-rose-950",
      )}
    >
      {message}
    </div>
  );
}

function PromptMetadataChips({
  prompt,
}: {
  prompt: CoreDashboardPromptVisibilityRow;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <StatusChip
        label={prompt.isActive ? "Active" : "Inactive"}
        tone={prompt.isActive ? "positive" : "muted"}
      />
      <StatusChip label={formatPromptFacet(prompt.sourceType, "Unknown source")} tone="info" />
      <StatusChip label={formatPromptFacet(prompt.clusterName, "Unclustered")} tone="default" />
      <StatusChip label={formatPromptFacet(prompt.intentType, "Unknown intent")} tone="muted" />
    </div>
  );
}

function PromptAnalysisTable({
  prompts,
  search,
}: {
  prompts: CoreDashboardPromptVisibilityRow[];
  search: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3">
        <thead>
          <tr>
            {["Prompt text", "Visibility %", "Last run by Prompt Runner", "Edit", "Delete"].map(
              (column) => (
                <th
                  key={column}
                  className="px-4 pb-1 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-black/38"
                >
                  {column}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {prompts.map((prompt) => (
            <tr key={prompt.promptId} className="align-top">
              <td className="rounded-l-[1.35rem] border border-r-0 border-black/8 bg-[var(--surface)] px-4 py-4 text-sm text-black/72">
                <p className="max-w-2xl text-sm leading-7 text-black">{prompt.promptText}</p>
                <PromptMetadataChips prompt={prompt} />
              </td>
              <td className="border-y border-black/8 bg-[var(--surface)] px-4 py-4 text-sm text-black/72">
                <StatusChip
                  label={formatPercent(prompt.visibilityPercent)}
                  tone={getVisibilityTone(prompt.visibilityPercent)}
                />
                <p className="mt-3 text-sm leading-6 text-black/58">
                  {prompt.visibilityPercent === null
                    ? "No completed executions yet."
                    : `${formatInteger(prompt.executionsWithBrandMention)} brand mentions across ${formatInteger(prompt.totalCompletedExecutions)} completed executions in the latest eligible run.`}
                </p>
              </td>
              <td className="border-y border-black/8 bg-[var(--surface)] px-4 py-4 text-sm text-black/72">
                <p className="font-medium text-black">
                  {prompt.lastRunAt ? formatRelativeTime(prompt.lastRunAt) : "Not run yet"}
                </p>
                <p className="mt-2 leading-6 text-black/58">
                  {prompt.lastRunAt ? formatDateTime(prompt.lastRunAt) : "No execution evidence yet."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusChip
                    label={
                      prompt.lastRunType ? formatPromptFacet(prompt.lastRunType, "Unknown run") : "Not available"
                    }
                    tone={prompt.lastRunType ? "info" : "muted"}
                  />
                </div>
              </td>
              <td className="border-y border-black/8 bg-[var(--surface)] px-4 py-4 text-sm text-black/72">
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/72 transition hover:border-black/18 hover:bg-white hover:text-black"
                  href={buildPromptsHref({ search, edit: prompt.promptId })}
                >
                  Edit
                </Link>
              </td>
              <td className="rounded-r-[1.35rem] border border-l-0 border-black/8 bg-[var(--surface)] px-4 py-4 text-sm text-black/72">
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-rose-900/12 px-4 py-2 text-sm text-rose-900 transition hover:border-rose-900/18 hover:bg-rose-900/[0.05]"
                  href={buildPromptsHref({ search, deleteId: prompt.promptId })}
                >
                  Delete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PromptLibraryList({
  items,
  projectId,
  search,
  capacity,
}: {
  items: CorePromptLibraryItem[];
  projectId: string;
  search: string;
  capacity: CorePromptCapacitySummary | null;
}) {
  const hasRemainingCapacity = capacity ? capacity.tracked_prompts_remaining > 0 : true;

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const isDisabled = item.is_imported || !hasRemainingCapacity;
        const disabledReason = item.is_imported
          ? "Already added"
          : !hasRemainingCapacity
            ? "No tracked prompt capacity remaining"
            : null;

        return (
          <article
            key={item.id}
            className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-7 text-black">{item.prompt_text}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip label={formatPromptFacet(item.cluster_name, "Unclustered")} />
                  <StatusChip label={formatPromptFacet(item.intent_type, "Unknown intent")} tone="muted" />
                  <StatusChip label={formatPromptFacet(item.language, "Unknown language")} tone="info" />
                  <StatusChip label={formatPromptFacet(item.source_type, "Library")} tone="default" />
                  {item.is_imported ? <StatusChip label="Imported" tone="positive" /> : null}
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-col items-start gap-3 lg:w-auto lg:items-end">
                <form action={importPromptLibraryItemAction}>
                  <input name="project_id" type="hidden" value={projectId} />
                  <input name="prompt_id" type="hidden" value={item.id} />
                  <input name="search" type="hidden" value={search} />
                  <button
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm transition",
                      isDisabled
                        ? "cursor-not-allowed border-black/10 bg-black/[0.04] text-black/38"
                        : "border-black bg-black text-white shadow-[0_14px_30px_rgba(17,17,17,0.12)] hover:bg-black/92",
                    )}
                    disabled={isDisabled}
                    type="submit"
                  >
                    {item.is_imported ? "Already Imported" : "Add to Analysis"}
                  </button>
                </form>
                <p className="text-sm leading-6 text-black/55">
                  {disabledReason ?? "Activates this generated project prompt and adds it to the tracked set."}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ModalFrame({
  title,
  description,
  closeHref,
  children,
}: {
  title: string;
  description: string;
  closeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_24px_90px_rgba(17,17,17,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/38">Prompt Action</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-black">{title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-black/58">{description}</p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/18 hover:text-black"
            href={closeHref}
          >
            Close
          </Link>
        </div>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}

function EditPromptModal({
  prompt,
  projectId,
  search,
  closeHref,
}: {
  prompt: CoreDashboardPromptVisibilityRow;
  projectId: string;
  search: string;
  closeHref: string;
}) {
  return (
    <ModalFrame
      closeHref={closeHref}
      description="Update the project-specific prompt text. The existing prompt identity stays in place so future sync and historical evidence continue to work."
      title="Edit Prompt"
    >
      <form action={updatePromptAction} className="grid gap-4">
        <input name="project_id" type="hidden" value={projectId} />
        <input name="prompt_id" type="hidden" value={prompt.promptId} />
        <input name="search" type="hidden" value={search} />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-black">Prompt text</span>
          <textarea
            className="min-h-48 rounded-[1.35rem] border border-black/10 bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-black outline-none transition focus:border-black/20"
            defaultValue={prompt.promptText}
            maxLength={2000}
            name="prompt_text"
            required
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex min-h-11 items-center rounded-full border border-black bg-black px-5 py-2 text-sm text-white shadow-[0_14px_30px_rgba(17,17,17,0.12)] transition hover:bg-black/92"
            type="submit"
          >
            Save prompt
          </button>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-black/10 px-5 py-2 text-sm text-black/72 transition hover:border-black/18 hover:bg-white hover:text-black"
            href={closeHref}
          >
            Cancel
          </Link>
        </div>
      </form>
    </ModalFrame>
  );
}

function DeletePromptModal({
  prompt,
  projectId,
  search,
  closeHref,
}: {
  prompt: CoreDashboardPromptVisibilityRow;
  projectId: string;
  search: string;
  closeHref: string;
}) {
  return (
    <ModalFrame
      closeHref={closeHref}
      description="Deleting archives the prompt for future tracking while preserving historical execution and analytics evidence."
      title="Delete Prompt"
    >
      <div className="rounded-[1.5rem] border border-rose-900/10 bg-rose-900/[0.05] p-5">
        <p className="text-sm leading-7 text-rose-950">{prompt.promptText}</p>
      </div>
      <form action={deletePromptAction} className="mt-5 flex flex-wrap gap-3">
        <input name="project_id" type="hidden" value={projectId} />
        <input name="prompt_id" type="hidden" value={prompt.promptId} />
        <input name="search" type="hidden" value={search} />
        <button
          className="inline-flex min-h-11 items-center rounded-full border border-rose-900 bg-rose-900 px-5 py-2 text-sm text-white transition hover:bg-rose-900/92"
          type="submit"
        >
          Confirm delete
        </button>
        <Link
          className="inline-flex min-h-11 items-center rounded-full border border-black/10 px-5 py-2 text-sm text-black/72 transition hover:border-black/18 hover:bg-white hover:text-black"
          href={closeHref}
        >
          Cancel
        </Link>
      </form>
    </ModalFrame>
  );
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const params = await searchParams;
  const search = readSingleValue(params.q)?.trim() ?? "";
  const editPromptId = readSingleValue(params.edit);
  const deletePromptId = readSingleValue(params.delete);
  const message = readSingleValue(params.message);
  const error = readSingleValue(params.error);
  const state = await getWorkspaceState();

  if (!state.project) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          description="Prompt Analysis and Prompt Library become available once onboarding creates the project."
          eyebrow="Prompts"
          title="No project is available yet."
        />
      </DashboardPage>
    );
  }

  const [analysisResult, libraryResult, capacityResult] = await Promise.allSettled([
    getCoreProjectVisibilityPrompts(state.project.id, {
      limit: 100,
      sortBy: "visibilityPercent",
      sortDirection: "desc",
    }),
    listCoreProjectPromptLibrary(state.project.id, {
      search: search || undefined,
      limit: 100,
    }),
    getCoreProjectPromptCapacity(state.project.id),
  ]);

  const promptAnalysis =
    analysisResult.status === "fulfilled" ? analysisResult.value : null;
  const promptLibrary =
    libraryResult.status === "fulfilled" ? libraryResult.value : null;
  const promptCapacity =
    capacityResult.status === "fulfilled" ? capacityResult.value : null;

  const promptAnalysisRows = promptAnalysis?.items ?? [];
  const editPrompt =
    editPromptId && promptAnalysis
      ? promptAnalysisRows.find((item) => item.promptId === editPromptId) ?? null
      : null;
  const deletePrompt =
    deletePromptId && promptAnalysis
      ? promptAnalysisRows.find((item) => item.promptId === deletePromptId) ?? null
      : null;
  const closeHref = buildPromptsHref({
    search,
    message,
    error,
  });

  return (
    <DashboardPage>
      <DashboardPageHeader
        description="Prompt Analysis shows the project prompts currently tracked for AI visibility. Prompt Library shows the larger project-specific prompt pool generated for this workspace and lets the team move more of those prompts into tracking while staying inside plan capacity."
        eyebrow="Prompts"
        title="Track the prompts that decide whether the brand shows up."
      />

      {message ? <NotificationBanner message={message} tone="positive" /> : null}
      {error ? <NotificationBanner message={error} tone="negative" /> : null}

      {analysisResult.status === "rejected" &&
      libraryResult.status === "rejected" &&
      capacityResult.status === "rejected" ? (
        <ErrorStatePanel
          description="Prompt analysis, prompt library, and quota summary could not be loaded from Core."
          title="The prompts workspace is temporarily unavailable."
        />
      ) : null}

      <SurfaceCard>
        <SectionHeading
          description="Tracked prompt capacity is the active prompt budget across the workspace. Daily tracked usage is the separate metered quota already enforced when daily tracking runs launch."
          eyebrow="Capacity"
          title="Prompt quota summary"
        />

        <div className="mt-7">
          {promptCapacity ? (
            <SummaryStrip
              items={[
                {
                  label: "Tracked prompts in use",
                  value: `${formatInteger(promptCapacity.tracked_prompts_in_use)} / ${formatInteger(promptCapacity.tracked_prompt_limit)}`,
                  detail: `${formatInteger(promptCapacity.active_project_prompt_count)} active prompts in this project.`,
                  tone:
                    promptCapacity.tracked_prompts_in_use >= promptCapacity.tracked_prompt_limit
                      ? "negative"
                      : "default",
                },
                {
                  label: "Tracked prompts remaining",
                  value: formatInteger(promptCapacity.tracked_prompts_remaining),
                  detail: "Add or reactivate prompts only while tracked capacity remains.",
                  tone: getCapacityTone(promptCapacity.tracked_prompts_remaining, 2),
                },
                {
                  label: "Daily tracked usage today",
                  value: `${formatInteger(promptCapacity.daily_tracked_prompts_used)} / ${formatInteger(promptCapacity.tracked_prompt_limit)}`,
                  detail: "Reserved when a daily tracking run is launched.",
                  tone:
                    promptCapacity.daily_tracked_prompts_used >= promptCapacity.tracked_prompt_limit
                      ? "warning"
                      : "info",
                },
                {
                  label: "Daily tracked prompts remaining",
                  value: formatInteger(promptCapacity.daily_tracked_prompts_remaining),
                  detail: "Resets on the current daily usage cycle.",
                  tone: getCapacityTone(promptCapacity.daily_tracked_prompts_remaining, 2),
                },
              ]}
            />
          ) : (
            <ErrorStatePanel
              description="Prompt capacity could not be loaded from Core. Import and activation are still enforced server-side, but the summary is unavailable right now."
              title="Quota summary is temporarily unavailable."
            />
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description="These are the project prompts currently attached to the workspace and eligible for tracking. Visibility comes from the latest completed or partial run that included each prompt."
          eyebrow="Primary section"
          title="Prompt Analysis"
        />

        <div className="mt-7">
          {analysisResult.status === "rejected" ? (
            <ErrorStatePanel
              description="Prompt-level visibility analytics could not be loaded from Core."
              title="Prompt Analysis is temporarily unavailable."
            />
          ) : promptAnalysisRows.length === 0 ? (
            <EmptyStatePanel
              description="No tracked prompts are attached to this project yet. Move project-generated prompts from Prompt Library into analysis, or regenerate prompts for this project."
              eyebrow="Prompt Analysis"
              title="No prompts are being tracked yet"
            />
          ) : (
            <PromptAnalysisTable prompts={promptAnalysisRows} search={search} />
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Generated pool"
          title="Prompt Library"
          description="Search the larger set of prompts generated specifically for this project and move more of them into the tracked analysis set when capacity allows."
          aside={
            <form action="/restricted/prompts" className="flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-11 rounded-full border border-black/10 bg-[var(--surface)] px-4 text-sm text-black outline-none transition focus:border-black/20"
                defaultValue={search}
                name="q"
                placeholder="Search prompt text, cluster, or intent"
                type="search"
              />
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/72 transition hover:border-black/18 hover:bg-white hover:text-black"
                type="submit"
              >
                Search
              </button>
            </form>
          }
        />

        <div className="mt-7">
          {libraryResult.status === "rejected" ? (
            <ErrorStatePanel
              description="The project-generated prompt pool could not be loaded from Core."
              title="Prompt Library is temporarily unavailable."
            />
          ) : promptLibrary && promptLibrary.length > 0 ? (
            <PromptLibraryList
              capacity={promptCapacity}
              items={promptLibrary}
              projectId={state.project.id}
              search={search}
            />
          ) : (
            <EmptyStatePanel
              description={
                search
                  ? "No generated prompts matched the current search. Try a broader query or clear the search field."
                  : "This project does not have any prompt-library items yet."
              }
              eyebrow="Prompt Library"
              title={search ? "No generated prompts matched this search" : "No project-generated prompts are available"}
              action={
                search
                  ? {
                      href: "/restricted/prompts",
                      label: "Clear search",
                    }
                  : undefined
              }
            />
          )}
        </div>
      </SurfaceCard>

      {editPrompt ? (
        <EditPromptModal
          closeHref={closeHref}
          projectId={state.project.id}
          prompt={editPrompt}
          search={search}
        />
      ) : null}

      {deletePrompt ? (
        <DeletePromptModal
          closeHref={closeHref}
          projectId={state.project.id}
          prompt={deletePrompt}
          search={search}
        />
      ) : null}
    </DashboardPage>
  );
}
