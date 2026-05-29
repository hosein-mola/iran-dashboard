# `components/` Guidelines (Shared UI + Features)

## Component Hygiene

- Keep components reusable; avoid hard-coding route logic in shared components.
- Prefer props over reading global state unless the component is explicitly tied to a context provider.
- If a component is client-only, add `"use client"` at the top and keep it client-safe.

## Styling

- Use the existing Tailwind + shadcn/ui approach.
- Prefer `cn()` (from `lib/utils.ts`) for class composition.
- Respect RTL + theme variants (light/dark/custom themes) when adjusting layout/alignment.

## Data / Side Effects

- Prefer data fetching and mutations in `app/` Server Components or `actions/`, not deep inside presentational components.
- Keep effects/event handlers minimal and predictable.
