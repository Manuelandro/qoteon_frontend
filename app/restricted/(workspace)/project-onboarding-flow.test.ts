import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCleanDashboardHref,
  buildOnboardingDashboardHref,
  getProjectOnboardingSessionStorageKey,
  getProjectOnboardingModalState,
  shouldDeferDashboardDataDuringOnboarding,
  shouldRefreshDashboardAfterOnboarding,
  shouldShowProjectOnboardingProgressModal,
  shouldTrackProjectOnboarding,
  type ProjectOnboardingProgressResponse,
} from "../../../utils/core/project-onboarding";

function buildProgress(
  overrides: Partial<ProjectOnboardingProgressResponse>,
): ProjectOnboardingProgressResponse {
  return {
    projectId: "project-1",
    status: "initializing",
    progressPercent: 15,
    message: "Setting up the project",
    isTerminal: false,
    dashboardReady: false,
    pollAfterMs: 3000,
    backendStateCode: null,
    backendStateMessage: null,
    ...overrides,
  };
}

test("buildOnboardingDashboardHref returns the restricted dashboard onboarding URL", () => {
  assert.equal(
    buildOnboardingDashboardHref("project-123"),
    "/restricted?onboarding=1&projectId=project-123",
  );
});

test("getProjectOnboardingSessionStorageKey scopes onboarding restoration by project", () => {
  assert.equal(
    getProjectOnboardingSessionStorageKey("project-123"),
    "qoteon:onboarding:project-123",
  );
});

test("shouldTrackProjectOnboarding restores tracking from the query flag and session state", () => {
  assert.equal(
    shouldTrackProjectOnboarding({
      projectId: "project-1",
      onboardingFlag: "1",
      onboardingProjectId: "project-1",
      persistedProjectId: null,
    }),
    true,
  );

  assert.equal(
    shouldTrackProjectOnboarding({
      projectId: "project-1",
      onboardingFlag: null,
      onboardingProjectId: null,
      persistedProjectId: "project-1",
    }),
    true,
  );

  assert.equal(
    shouldTrackProjectOnboarding({
      projectId: "project-1",
      onboardingFlag: "1",
      onboardingProjectId: "project-2",
      persistedProjectId: null,
    }),
    false,
  );
});

test("shouldDeferDashboardDataDuringOnboarding only for the active onboarding project", () => {
  assert.equal(
    shouldDeferDashboardDataDuringOnboarding({
      projectId: "project-1",
      onboardingFlag: "1",
      onboardingProjectId: "project-1",
    }),
    true,
  );

  assert.equal(
    shouldDeferDashboardDataDuringOnboarding({
      projectId: "project-1",
      onboardingFlag: "1",
      onboardingProjectId: "project-2",
    }),
    false,
  );

  assert.equal(
    shouldDeferDashboardDataDuringOnboarding({
      projectId: "project-1",
      onboardingFlag: null,
      onboardingProjectId: null,
    }),
    false,
  );
});

test("getProjectOnboardingModalState reflects the polled progress message", () => {
  const state = getProjectOnboardingModalState(
    buildProgress({
      status: "generating_prompts",
      progressPercent: 65,
      message: "Retrieving the relevant prompts",
    }),
    null,
  );

  assert.equal(state.isVisible, true);
  assert.equal(state.mode, "progress");
  assert.equal(state.title, "Preparing your dashboard");
  assert.equal(state.message, "Retrieving the relevant prompts");
  assert.equal(state.progressPercent, 65);
});

test("getProjectOnboardingModalState switches to the fallback blocked mode for terminal failures", () => {
  const state = getProjectOnboardingModalState(
    buildProgress({
      status: "running_baseline",
      progressPercent: 90,
      isTerminal: true,
      backendStateCode: "baseline_failed_blocked",
      backendStateMessage: "The initial baseline is blocked and needs operator attention.",
    }),
    null,
  );

  assert.equal(state.isVisible, true);
  assert.equal(state.mode, "blocked");
  assert.equal(state.title, "Setup is taking longer than expected");
  assert.equal(
    state.message,
    "The initial baseline is blocked and needs operator attention.",
  );
  assert.equal(state.backendStateCode, "baseline_failed_blocked");
});

test("shouldRefreshDashboardAfterOnboarding only flips when Core marks the dashboard ready", () => {
  assert.equal(
    shouldRefreshDashboardAfterOnboarding(
      buildProgress({
        status: "running_baseline",
        dashboardReady: false,
      }),
      buildProgress({
        status: "completed",
        progressPercent: 100,
        dashboardReady: true,
        isTerminal: true,
      }),
    ),
    true,
  );

  assert.equal(
    shouldRefreshDashboardAfterOnboarding(
      buildProgress({
        status: "running_baseline",
        dashboardReady: false,
      }),
      buildProgress({
        status: "running_baseline",
        dashboardReady: false,
      }),
    ),
    false,
  );
});

test("shouldShowProjectOnboardingProgressModal hides the modal on onboarding routes", () => {
  assert.equal(
    shouldShowProjectOnboardingProgressModal({
      pathname: "/restricted/onboarding/competitors",
      activeProjectId: "project-1",
      dismissed: false,
    }),
    false,
  );

  assert.equal(
    shouldShowProjectOnboardingProgressModal({
      pathname: "/restricted",
      activeProjectId: "project-1",
      dismissed: false,
    }),
    true,
  );
});

test("buildCleanDashboardHref removes onboarding query params after completion", () => {
  const searchParams = new URLSearchParams({
    onboarding: "1",
    projectId: "project-1",
    run: "baseline-1",
  });

  assert.equal(
    buildCleanDashboardHref("/restricted", searchParams),
    "/restricted?run=baseline-1",
  );
});
