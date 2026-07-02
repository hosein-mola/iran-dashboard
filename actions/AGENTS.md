# `actions/` Guidelines (Server Actions)

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- Keep actions server-only (no browser APIs).
- Validate all input with `schemas/` before DB writes or external calls.
- Keep actions single-purpose and return JSON-serializable data.
- Revalidate all impacted routes after mutations.
- For destructive admin operations, enforce server-side dependency checks and clear Persian error messages.
