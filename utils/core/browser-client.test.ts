import test from "node:test";
import assert from "node:assert/strict";

import {
  CoreBrowserApiError,
  shouldSuppressCoreOnboardingProgressError,
} from "./browser-client";

test("shouldSuppressCoreOnboardingProgressError hides transient onboarding poll failures", () => {
  assert.equal(
    shouldSuppressCoreOnboardingProgressError(
      new CoreBrowserApiError("Project not found", 404),
    ),
    true,
  );

  assert.equal(
    shouldSuppressCoreOnboardingProgressError(
      new CoreBrowserApiError("reconciler returned 500", 500),
    ),
    true,
  );

  assert.equal(
    shouldSuppressCoreOnboardingProgressError(
      new CoreBrowserApiError("Core denied access", 403),
    ),
    false,
  );

  assert.equal(
    shouldSuppressCoreOnboardingProgressError(
      new Error("network failed"),
    ),
    false,
  );
});
