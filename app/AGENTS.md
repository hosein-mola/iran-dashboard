# `app/` Guidelines (App Router)

Scope: routes, layouts, pages, and route handlers.

## Build Here

- Keep module-facing screens under `app/(modules)` and keep `/modules` as the module hub.
- Use `layout.tsx` for shared segment chrome/providers.
- Keep `page.tsx` thin; compose logic from `components/`, `actions/`, and `lib/`.
- Use `route.ts` only for HTTP handlers.

## Boundaries

- Server Component by default; add `"use client"` only for browser state/effects/APIs.
- Do not import server-only modules into client files.
- Keep caching/revalidation explicit to avoid stale behavior.

## Route Safety

- On route remove/rename, also clean breadcrumbs, navigation, revalidation calls, and docs.
- Verify cleanup with `rg` and `npx tsc --noEmit`.
