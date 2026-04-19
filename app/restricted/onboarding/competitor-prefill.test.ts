import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInitialOnboardingCompetitorDomains,
  mergeOnboardingPrefilledCompetitorDomains,
} from "../../../utils/core/onboarding-competitor-prefill";

test("buildInitialOnboardingCompetitorDomains keeps one empty slot when no prefills exist", () => {
  assert.deepEqual(buildInitialOnboardingCompetitorDomains([]), [""]);
});

test("buildInitialOnboardingCompetitorDomains trims and caps the prefilled list", () => {
  assert.deepEqual(
    buildInitialOnboardingCompetitorDomains([
      "  first.com  ",
      "second.com",
      "third.com",
      "ignored.com",
    ], 3),
    ["first.com", "second.com", "third.com"],
  );
});

test("mergeOnboardingPrefilledCompetitorDomains replaces an empty manual state with suggestions", () => {
  assert.deepEqual(
    mergeOnboardingPrefilledCompetitorDomains([""], [
      "first.com",
      "second.com",
      "third.com",
    ]),
    ["first.com", "second.com", "third.com"],
  );
});

test("mergeOnboardingPrefilledCompetitorDomains preserves manual input and fills remaining slots", () => {
  assert.deepEqual(
    mergeOnboardingPrefilledCompetitorDomains(
      ["manual.com", "", ""],
      ["manual.com", "suggested.com", "extra.com"],
      3,
    ),
    ["manual.com", "suggested.com", "extra.com"],
  );
});
