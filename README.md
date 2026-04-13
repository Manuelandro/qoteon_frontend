# Qoteon Frontend

`qoteon_frontend` is the owner-facing Next.js app for Qoteon.

It handles login, onboarding, and the analyst workspace. Product data comes from Core, not from frontend-local business tables.

## Current implementation status

Implemented:

- Supabase Auth login flow and protected restricted routes
- Core-backed onboarding
- draft onboarding state stored only as a short-lived cookie
- Core-backed project, competitor, prompt-context, dashboard, run-progress, and run-result reads
- multi-page analyst workspace under `/restricted`
- setup-state surfaces for crawl, prompt readiness, and blocked-client-crawl states
- editable competitor prefills during onboarding
- onboarding fallback to manual competitor entry when prefill fails in a recoverable way
- automatic first baseline path after onboarding once downstream readiness is complete

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
5. activate the project

### Workspace

The restricted area currently includes:

- Overview
- Models
- Clusters
- Competitors
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

## Environment notes

Important variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `QOTEON_CORE_API_URL`

See [`.env.example`](./.env.example) for the current defaults.
