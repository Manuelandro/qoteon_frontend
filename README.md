# Qoteon Frontend

`qoteon_frontend` is the owner-facing Next.js app for Qoteon.

It handles login, onboarding, and the analyst workspace. Product data comes from Core, not from frontend-local business tables.

## Current implementation status

Implemented:

- Supabase Auth login flow and protected restricted routes
- Core-backed onboarding
- draft onboarding state stored only as a short-lived cookie
- immediate redirect from the onboarding competitors confirmation step into `/restricted?onboarding=1&projectId=<id>` once Core accepts project activation
- Core-backed project, competitor, crawl-intelligence, dashboard, run-progress, and run-result reads
- multi-page analyst workspace under `/restricted`
- restricted overview onboarding-progress modal that polls Core from the browser, keeps the dashboard visible behind the modal, and refreshes the overview automatically when Core marks the dashboard ready
- Core-backed prompts workspace under `/restricted/prompts` with `Prompt Analysis` and `Prompt Library`
- prompt edit, archive, and project-generated prompt-pool activation actions routed only through Core
- tracked prompt capacity and daily tracked usage summary rendered in the prompts workspace
- setup-state surfaces for crawl progress, prompt generation, and blocked-client-crawl states
- editable competitor prefills during onboarding
- competitor-prefill onboarding flow is idempotent against duplicate in-flight project-creation requests, so a just-created draft project is reused instead of surfacing the trial domain-limit error
- onboarding fallback to manual competitor entry when prefill fails in a recoverable way
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
4. let the user confirm or replace competitors
5. activate the project through Core
6. immediately replace into `/restricted?onboarding=1&projectId=<id>`
7. render the restricted overview behind a centered progress modal while the browser polls Core for onboarding completion
8. clear the modal and refresh the dashboard only when Core reports that dashboard data is actually ready

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
