# Qoteon Frontend

`qoteon_frontend` is the owner-facing Next.js app for Qoteon.

It handles login, onboarding, and the analyst workspace. Product data comes from Core, not from frontend-local business tables.

## Current implementation status

Implemented:

- Supabase Auth login flow and protected restricted routes
- Core-backed onboarding
- draft onboarding state stored only as a short-lived cookie
- immediate redirect from the onboarding competitors confirmation step into `/restricted?onboarding=1&projectId=<id>` once Core accepts project activation
- the competitors confirmation step no longer waits for Core crawl bootstrap or prompt generation to finish before the redirect happens
- the onboarding progress modal now lives at the restricted-layout level, so it can stay mounted through the competitors-to-dashboard route handoff while remaining hidden on `/restricted/onboarding/*`
- Core-backed project, competitor, crawl-intelligence, dashboard, run-progress, and run-result reads
- multi-page analyst workspace under `/restricted`
- restricted-layout onboarding-progress modal that polls Core from the browser, keeps the dashboard visible behind the modal, and refreshes the overview automatically when Core marks the dashboard ready
- restricted workspace chrome and overview onboarding entry now use a lightweight Core shell read, so the modal can appear immediately without waiting for the first overview KPI fetch
- onboarding progress tracking is persisted in browser session storage before the competitors-to-dashboard redirect completes, so the same modal can survive the route handoff and continue polling the same project
- the activated project id is also written into that handoff state before the redirect completes, so the modal still starts when onboarding did not already have a draft project id on the competitors screen
- the restricted-layout modal now also listens to a client-side onboarding handoff store, so it reacts immediately when the competitors step seeds the active project id instead of waiting for a later rerender
- Core-backed prompts workspace under `/restricted/prompts` with `Prompt Analysis` and `Prompt Library`
- prompt edit, archive, and project-generated prompt-pool activation actions routed only through Core
- tracked prompt capacity and daily tracked usage summary rendered in the prompts workspace
- setup-state surfaces for crawl progress, prompt generation, and blocked-client-crawl states
- editable competitor prefills during onboarding
- competitor-prefill onboarding flow is idempotent against duplicate in-flight project-creation requests, so a just-created draft project is reused instead of surfacing the trial domain-limit error
- onboarding fallback to manual competitor entry when prefill fails in a recoverable way, without leaving the form polling for a full suggested set
- competitor prefill always resolves the loading state once Core responds, so the competitors step no longer gets stuck on "Finding competitor suggestions" under React strict-mode double-invoke
- onboarding-progress polling stops retrying and clears the stored handoff id when Core responds with 404, so a stale project id from a prior attempt can no longer strand the modal on "Project not found"
- automatic first baseline path after onboarding once downstream readiness is complete
- run counters on terminal batches now fall back to batch status when the live progress read is temporarily unavailable, so completed runs do not render as `0 complete`

Deferred:

- multi-project switching
- prompt-level drilldowns
- richer recommendation surfaces
- editing project metadata from the UI

## Product flow

### Onboarding

1. sign in with Supabase
2. create or reuse a Core trial organization and draft project
3. ask Core for competitor prefills
4. if prefills fail recoverably, stop waiting and let the user continue with manual competitor entry immediately
5. let the user confirm or replace competitors
6. seed the restricted-layout onboarding handoff state as the competitors confirmation redirects into the dashboard
7. activate the project through Core
8. immediately replace into `/restricted?onboarding=1&projectId=<id>`
9. show the same modal only after the browser reaches `/restricted`, then keep it mounted while Core polling continues
10. render a lightweight restricted overview shell behind that modal and defer the first heavy overview KPI reads until the modal clears

### Workspace

The restricted area currently includes:

- Overview
- Models
- Clusters
- Competitors
- Prompts
- Trends
- Runs
- Data Health

All of those reads come from Core-backed routes.

## Local run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm test`

## Environment notes

Important variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `QOTEON_CORE_API_URL`
- `NEXT_PUBLIC_QOTEON_CORE_API_URL`

Notes:

- server-rendered Core reads still use `QOTEON_CORE_API_URL`
- browser-side onboarding-progress polling should use a browser-reachable Core URL through `NEXT_PUBLIC_QOTEON_CORE_API_URL` whenever the frontend and Core do not share the same origin

See [`.env.example`](./.env.example) for the current defaults.
