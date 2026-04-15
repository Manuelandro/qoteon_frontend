import test from "node:test";
import assert from "node:assert/strict";

import type { CoreProject } from "../../../utils/core/client";
import {
  isRecoverableOnboardingProjectCreateError,
  selectExistingOnboardingProject,
} from "../../../utils/core/onboarding-project-recovery";

function buildProject(overrides: Partial<CoreProject>): CoreProject {
  return {
    id: "project-1",
    organization_id: "org-1",
    name: "Acme",
    domain: "acme.com",
    company_name: "Acme",
    primary_category: "SaaS",
    target_region: ["Worldwide"],
    target_language: "en",
    status: "draft",
    created_at: "2026-04-15T08:00:00.000Z",
    updated_at: "2026-04-15T08:00:00.000Z",
    ...overrides,
  };
}

test("detects the trial domain-limit race as a recoverable onboarding create error", () => {
  const error = {
    message: "The trial plan supports up to 1 domains.",
    status: 400,
  };

  assert.equal(isRecoverableOnboardingProjectCreateError(error), true);
  assert.equal(
    isRecoverableOnboardingProjectCreateError(new Error("The trial plan supports up to 1 domains.")),
    false,
  );
});

test("prefers the same-domain onboarding project when recovering after a create conflict", () => {
  const selected = selectExistingOnboardingProject(
    [
      buildProject({
        id: "project-active",
        domain: "old-domain.com",
        status: "active",
        updated_at: "2026-04-15T08:00:00.000Z",
      }),
      buildProject({
        id: "project-draft",
        domain: "new-domain.com",
        status: "draft",
        updated_at: "2026-04-15T08:05:00.000Z",
      }),
    ],
    "new-domain.com",
  );

  assert.equal(selected?.id, "project-draft");
});
