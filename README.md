# Qoteon Frontend

Next.js 16 frontend for Qoteon.

## Current implementation status

- Implemented:
  - Supabase Auth login and protected restricted routes
  - Core-backed first-access onboarding
  - server-side Core API client utilities for organizations, projects, competitors, prompt-context, and overview reads
  - project setup status aggregation for crawl progress, prompt-context readiness, blocked client crawl state, and ready-to-run prompt availability
  - restricted workspace loading its base state from `qoteon_core_api`
  - OpenAI-powered competitor suggestions during onboarding
- Important behavior:
  - Supabase still owns authentication and the minimal `public.profiles.first_access` flag
  - the frontend no longer treats `public.company` and `public.competitors` as the source of truth for the main product workflow
  - onboarding step 1 stores only a short-lived company draft cookie
  - onboarding step 2 ensures a Core organization, creates or reuses the Core project, and stores competitors in Core-owned project competitor records
- Deferred:
  - project switching for users with multiple Core projects
  - richer dashboard screens beyond the current restricted workspace base state
  - editing Core competitors and project metadata from the UI

## Required environment

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
QOTEON_CORE_API_URL=<core-api-base-url>
```

Optional onboarding suggestions:

```bash
OPENAI_API_KEY=<openai-api-key>
OPENAI_COMPETITOR_MODEL=gpt-5-mini
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
