# Qoteon Frontend

Next.js 16 frontend for Qoteon.

## Current implementation status

- Implemented:
  - Supabase Auth login and protected restricted routes
  - Core-backed first-access onboarding
  - region-mode onboarding with `Worldwide` or multi-select continent/country arrays
  - server-side Core API client utilities for organizations, projects, competitors, prompt-context, overview, visibility breakdowns, trends, run batches, run progress, and run results
  - project setup status aggregation for crawl progress, prompt-context readiness, blocked client crawl state, and ready-to-run prompt availability
  - restricted workspace loading its analyst dashboard state from `qoteon_core_api`
  - V1 multi-page analyst dashboard under `/restricted` with:
    - Overview
    - Models
    - Clusters
    - Competitors
    - Trends
    - Runs
    - Data Health
  - real Core-backed dashboard reads for overview, model comparison, cluster comparison, competitor comparison, time-series trends, run evidence, and crawl/prompt readiness diagnostics
  - reusable analyst-dashboard UI system for headers, KPI cards, summary strips, health flags, empty states, chart frames, and dense comparison tables
  - Core-backed onboarding competitor prefills sourced from Prompt Runner and rendered as editable form rows
  - step 2 loading UX that renders immediately, shows “Finding the first 3 competitors...”, and polls the server every 500ms until the Core-backed prefills are ready
  - onboarding competitor selection capped to the Starter onboarding allowance, with replace-by-remove behavior before final save
- Important behavior:
  - Supabase still owns authentication and the minimal `public.profiles.first_access` flag
  - the frontend no longer treats `public.company` and `public.competitors` as the source of truth for the main product workflow
  - onboarding step 1 stores only a short-lived company draft cookie
  - onboarding step 2 ensures a Core organization, creates or reuses the Core project, asks Core to prefill 3 initial competitors, and lets the user swap entries while keeping the final list capped at 3 before entering the workspace
  - onboarding completion now follows `public.profiles.first_access`, so persisted prefills do not skip the confirmation step
  - overview and data-health pages still surface setup and readiness state explicitly when run-backed analytics are not available yet
- Deferred:
  - project switching for users with multiple Core projects
  - prompt-level explorer and citation/source drilldowns
  - recommendation or anomaly-detection surfaces
  - editing Core competitors and project metadata from the UI

## Required environment

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
QOTEON_CORE_API_URL=<core-api-base-url>
```

`QOTEON_CORE_API_URL` should point to the authenticated Core API:

- local: `http://127.0.0.1:4000`
- production: `https://<your-core-service>.onrender.com`

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

The current frontend changes were verified with:

```bash
npm run lint
npx tsc --noEmit
npm run build
```
