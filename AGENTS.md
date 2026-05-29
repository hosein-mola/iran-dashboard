# Repository Guidelines (Next.js 16)

Default rules for the repo. Nested `AGENTS.md` files override these in their folders.

## Fast Commands

- `npm run dev` (Turbopack, port `3000`)
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run apply-patches`

## Core Rules

- Keep diffs small and targeted; do not reformat unrelated files.
- App Router default: Server Components first; add `"use client"` only when required.
- Reuse existing stack before adding abstractions (Prisma + SQLite, AG Grid, shadcn/ui, theme tokens).
- Respect Persian RTL and existing branding unless a redesign is requested.

## High-Signal Preferences

- Implement on the exact runtime route the user names.
- Route deletion means full cleanup: pages, links, breadcrumbs, `revalidatePath`, docs, and stale references.
- For form-builder datasource/defaults, keep preview and submit hydration aligned.

## Verification

- Primary check: `npx tsc --noEmit` (especially after route edits).
- If route types are stale, clear `.next` and rerun typecheck.
- Run `npm run lint` when feasible; if lint tooling is unstable, report it and use typecheck/build.
- After route changes, confirm no dead references with `rg`.
