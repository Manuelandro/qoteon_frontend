import test from "node:test";
import assert from "node:assert/strict";

import {
  DASHBOARD_TIME_RANGE_PRESETS,
  buildDashboardWindow,
  isDashboardTimeRangePreset,
} from "./dashboard-windows";
import { buildPromptEvidenceHref } from "./prompt-evidence-links";

test("dashboard time range presets include prompt and competitor analytics windows", () => {
  assert.deepEqual(DASHBOARD_TIME_RANGE_PRESETS, [
    "last_24h",
    "last_7d",
    "last_month",
    "last_3_months",
    "last_6_months",
    "last_year",
    "total",
  ]);

  assert.equal(isDashboardTimeRangePreset("last_24h"), true);
  assert.equal(isDashboardTimeRangePreset("unsupported"), false);
});

test("buildDashboardWindow uses rolling explicit timestamps and omits total bounds", () => {
  const now = new Date("2026-04-24T12:00:00.000Z");

  assert.deepEqual(buildDashboardWindow("last_24h", now), {
    startDate: "2026-04-23T12:00:00.000Z",
    endDate: "2026-04-24T12:00:00.000Z",
  });

  assert.deepEqual(buildDashboardWindow("last_7d", now), {
    startDate: "2026-04-17T12:00:00.000Z",
    endDate: "2026-04-24T12:00:00.000Z",
  });

  assert.deepEqual(buildDashboardWindow("total", now), {});
});

test("buildPromptEvidenceHref opens mention and citation drilldowns without embedding responses", () => {
  assert.equal(
    buildPromptEvidenceHref({
      search: "brand",
      range: "last_7d",
      evidencePromptId: "prompt-1",
      evidenceType: "mentions",
    }),
    "/restricted/prompts?q=brand&evidence=prompt-1&evidenceType=mentions&range=last_7d",
  );

  assert.equal(
    buildPromptEvidenceHref({
      range: "last_3_months",
      evidencePromptId: "prompt-1",
      evidenceType: "citations",
    }),
    "/restricted/prompts?evidence=prompt-1&evidenceType=citations&range=last_3_months",
  );

  assert.equal(buildPromptEvidenceHref({ range: "last_24h" }), "/restricted/prompts");
});
