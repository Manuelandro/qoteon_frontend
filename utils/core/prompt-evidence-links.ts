import type { DashboardTimeRangePreset } from "./dashboard-windows";

export type PromptEvidenceLinkType = "mentions" | "citations";

export type PromptEvidenceHrefInput = {
  search?: string;
  edit?: string;
  deleteId?: string;
  evidencePromptId?: string;
  evidenceType?: PromptEvidenceLinkType;
  message?: string;
  error?: string;
  range?: DashboardTimeRangePreset;
};

export function buildPromptEvidenceHref(input: PromptEvidenceHrefInput) {
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

  if (input.evidencePromptId) {
    params.set("evidence", input.evidencePromptId);
  }

  if (input.evidenceType) {
    params.set("evidenceType", input.evidenceType);
  }

  if (input.range && input.range !== "last_24h") {
    params.set("range", input.range);
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
