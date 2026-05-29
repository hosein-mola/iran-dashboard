# `components/` Guidelines (Shared UI + Features)

- Reuse existing shared components before creating new ones (especially AG Grid and shadcn wrappers).
- Keep shared components route-agnostic; pass route behavior through props.
- Use `"use client"` only when needed.
- Respect RTL and all supported themes (`light`, `dark`, `wood`).
- Prefer restrained polish (spacing, contrast, hierarchy) over redesign unless requested.
- Keep data fetching and mutations in `app/`/`actions/`, not deep in presentational components.
