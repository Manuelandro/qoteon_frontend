<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# ALGOME Base Schema

## What This Is
A SaaS that helps companies to appear as results/responses in the LLM Chatbots like ChatGPT, Gemini, Claude, etc.

## How It's Organized
- app/page ins the landing page of Qoteon
- app/restricted contains the user personal area

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **UI**: Tailwind CSS + Custom primitives
- **State**: Jotai (atomic state) + React Query
- **Auth**: Supabase on Vercel
- **Monitoring**: Sentry

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components (60+ directories)
├── hooks/        # Custom React hooks
├── api/          # API layer (fetch, React Query hooks)
├── utils/        # Utility functions
├── atoms/        # Jotai state atoms
├── ui/           # UI components and icons
└── configs/      # Configuration files
```

## Code Standards

- **Naming**: PascalCase (components), camelCase (functions), SCREAMING_SNAKE_CASE (constants)
- **Files**: kebab-case
- **No** `any` without justification
- **No** `@ts-ignore` without explanation
- **Imports**: external → internal → relative

## Code Review Guidelines

Focus on finding real problems that could break production.


### Check For

**Bugs & Regressions**
- Logic errors and unhandled edge cases
- Breaking changes to existing behavior
- Incorrect dependency arrays in hooks
- Missing cleanup in useEffect

**Error & Loading States**
- Missing try/catch for async operations
- Unhandled promise rejections
- Missing loading/error states in UI

**State Management**
- Race conditions and stale state
- Incorrect Jotai atom usage
- Missing React Query cache invalidation

**Performance**
- Unnecessary re-renders
- Missing memoization for expensive computations
- Large objects in dependency arrays

### Ignore

- Code style (ESLint)
- Type annotations (TypeScript)
- Test files

### Output Format

Report only actual issues. Be specific about what could go wrong. Provide fix when possible.
