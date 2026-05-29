# `app/` Guidelines (Next.js 16 App Router)

## Server/Client Boundaries

- Files here are Server Components by default.
- Add `"use client"` only when the component needs browser APIs, React state/effects, or client-only libraries.
- Do not import Client Components into Server-only modules that must remain server-only (keep the boundary explicit).

## Routing Conventions

- Use `layout.tsx` for shared chrome and providers scoped to a segment.
- Use `page.tsx` for route entrypoints; keep pages thin (compose from `components/`).
- Use `route.ts` for HTTP handlers; return `Response`/`NextResponse` and validate inputs.
- Keep route segment names stable; if removing routes, also remove all references (breadcrumbs, nav links, revalidation hooks).

## Data Fetching

- Prefer server-side fetching in Server Components when possible.
- Be explicit about caching/revalidation when needed (avoid accidental stale data).
- Keep fetch helpers in `lib/` so they can be shared and audited.

## DX / Safety

- Avoid reading `window`, `document`, or `localStorage` without `"use client"`.
- Avoid importing heavy client deps into server components.
