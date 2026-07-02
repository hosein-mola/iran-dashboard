# `components/` Guidelines (Shared UI + Features)

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- Reuse existing shared components before creating new ones (especially AG Grid and shadcn wrappers).
- Keep shared components route-agnostic; pass route behavior through props.
- Use `"use client"` only when needed.
- Respect RTL and all supported themes (`light`, `dark`, `wood`).
- Prefer restrained polish (spacing, contrast, hierarchy) over redesign unless requested.
- Keep data fetching and mutations in `app/`/`actions/`, not deep in presentational components.
