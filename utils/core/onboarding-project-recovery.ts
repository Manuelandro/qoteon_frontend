import type { CoreProject } from "./client";

function toTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function isRecoverableOnboardingProjectCreateError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const status = "status" in error ? error.status : undefined;
  const message = "message" in error ? error.message : undefined;

  if (status !== 400 || typeof message !== "string") {
    return false;
  }

  return (
    message.includes("supports up to") &&
    message.includes("domains")
  );
}

export function selectExistingOnboardingProject(
  projects: CoreProject[],
  companyDomain: string,
): CoreProject | null {
  if (projects.length === 0) {
    return null;
  }

  const byFreshness = [...projects].sort(
    (left, right) => toTimestamp(right.updated_at) - toTimestamp(left.updated_at),
  );

  return (
    byFreshness.find((project) => project.domain === companyDomain) ??
    byFreshness.find((project) => project.status === "draft") ??
    byFreshness[0] ??
    null
  );
}
