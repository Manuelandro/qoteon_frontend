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
- the competitors save action now redirects from the server straight into `/restricted?onboarding=1&projectId=<id>`, so the restricted-layout modal can use the URL as the single source of truth for which project to poll
- the restricted-layout modal now only needs the onboarding query flag and project id to poll Core and render the progress state, which removes the previous client-side handoff-store and session-storage tracking path
- Core-backed prompts workspace under `/restricted/prompts` with `Prompt Analysis` and `Prompt Library`
- prompt analytics rolling windows defaulting to `last_24h`, with client mention and client citation counts from Core-backed Dashboard reads
- lazy prompt evidence drilldowns for client mention-backed and client citation-backed full responses
- competitors workspace comparison list with client-first ordering, visibility score, share of voice, mentions, and citations
- prompt edit, archive, and project-generated prompt-pool activation actions routed only through Core
- tracked prompt capacity and daily tracked usage summary rendered in the prompts workspace
- setup-state surfaces for crawl progress, prompt generation, and blocked-client-crawl states
- editable competitor prefills during onboarding
- competitor-prefill onboarding flow is idempotent against duplicate in-flight project-creation requests, so a just-created draft project is reused instead of surfacing the trial domain-limit error
- onboarding fallback to manual competitor entry when prefill fails in a recoverable way, without leaving the form polling for a full suggested set
- competitor prefill always resolves the loading state once Core responds, so the competitors step no longer gets stuck on "Finding competitor suggestions" under React strict-mode double-invoke
- the competitors step now keeps the browser-side prefill request alive for up to 60 seconds while manual editing stays available, so slower healthy provider responses can still merge suggested domains into the form before the client falls back to manual entry
- onboarding-progress polling swallows transient 404s and `5xx` setup-read failures silently (no raw Core/Reconciler error flash in the modal) and keeps retrying on the normal cadence so the modal stays visible while backend setup catches up
- automatic first baseline path after onboarding once downstream readiness is complete
- run counters on terminal batches now fall back to batch status when the live progress read is temporarily unavailable, so completed runs do not render as `0 complete`
- multi-stage Docker image for self-hosted production deployment

Deferred:

- multi-project switching
- richer recommendation surfaces
- editing project metadata from the UI

## Product flow

### Onboarding

1. sign in with Supabase
2. create or reuse a Core trial organization and draft project
3. ask Core for competitor prefills
4. if prefills fail recoverably, stop waiting and let the user continue with manual competitor entry immediately
5. let the user confirm or replace competitors
6. activate the project through Core
7. redirect from the server straight into `/restricted?onboarding=1&projectId=<id>`
8. let the restricted-layout modal poll Core while that onboarding query is present
9. render a lightweight restricted overview shell behind that modal and defer the first heavy overview KPI reads until the modal clears

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

The Prompts page supports `last_24h`, `last_7d`, `last_month`, `last_3_months`, `last_6_months`, `last_year`, and `total` windows. Mention and citation pills are client-only metrics. They update the URL with `evidence=<promptId>` and `evidenceType=mentions|citations`, then lazily ask Core for the matching client evidence payload. The table response stays compact; full responses are only loaded for the expanded prompt row.

The Competitors page uses the same window presets. It renders the client row first and then configured competitors in Dashboard Layer order, showing `Visibility Score`, `Share of Voice`, `Mentions`, and `Citations`. If a selected window has no materialized workflow data, the page shows an explicit empty state for that window.

## Local run

```bash
npm install
npm run dev
```

## Docker

Build the production image from the service directory:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key \
  --build-arg NEXT_PUBLIC_QOTEON_CORE_API_URL=https://your-core-service.example.com \
  -t qoteon-frontend .
```

Run the container:

```bash
docker run --rm -p 3000:3000 \
  -e QOTEON_CORE_API_URL=http://qoteon-core-api:4000 \
  qoteon-frontend
```

Notes:

- `NEXT_PUBLIC_*` values are compiled into the client bundle during `next build`, so they must be present as Docker build args when the image is created
- `QOTEON_CORE_API_URL` is still needed at runtime for server-rendered Core reads
- if browser-side onboarding polling needs a different public Core origin, set `NEXT_PUBLIC_QOTEON_CORE_API_URL` at build time to that browser-reachable URL

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
- container builds also need the `NEXT_PUBLIC_*` variables at build time because Next.js bakes them into the client bundle

See [`.env.example`](./.env.example) for the current defaults.
