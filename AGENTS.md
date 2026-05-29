# Repository Guidelines (Next.js 16)

Keep this file short. Folder-specific rules live in nested `AGENTS.md` files and override this one within their directory scope.

## Quick Commands

- Dev: `npm run dev` (Turbopack, port 3000)
- Lint/typecheck gate: `npm run lint`
- Build: `npm run build`
- Start (prod simulation): `npm run start`
- Apply `package/` patches into `node_modules/`: `npm run apply-patches`

## Project Layout

- `app/` — Next.js App Router (`layout.tsx`, `page.tsx`, `route.ts` handlers)
- `actions/` — server actions and server-side mutations used by the UI
- `components/` — shared React components (UI + feature components)
- `components/ui/` — shadcn/ui primitives (keep APIs stable)
- `lib/` — shared utilities (fetch wrappers, helpers, `cn`, etc.)
- `schemas/` — validation schemas (Zod)
- `api/` — backend-facing helpers/config for API surface in this repo
- `prisma/` — Prisma schema/migrations
- `package/` — files copied into `node_modules/` by `npm run apply-patches`

## Default Conventions

- Next.js 16 App Router: assume Server Components by default; add `"use client"` only when needed.
- Keep server-only code out of client bundles (no `process.env` access in client components, no Node-only modules in `components/` unless explicitly client-safe).
- Prefer `clsx` + `tailwind-merge` via the repo’s `cn()` helper (see `lib/utils.ts`).
- Use Tailwind + existing shadcn/ui patterns; avoid introducing new styling systems.
- Prefer small, targeted diffs; do not reformat unrelated files.

## Before You Finish

- Run `npm run lint` and fix issues in touched files.
- If you added/removed routes, ensure imports/links/breadcrumbs are cleaned up and no dead references remain.

## Scoped AGENTS.md Files

- `app/AGENTS.md`
- `actions/AGENTS.md`
- `components/AGENTS.md`
- `components/ui/AGENTS.md`
- `api/AGENTS.md`
- `schemas/AGENTS.md`
- `lib/AGENTS.md`
- `prisma/AGENTS.md`
- `package/AGENTS.md`
