# `actions/` Guidelines (Server Actions)

- Keep actions server-only (no browser APIs).
- Validate all input with `schemas/` before DB writes or external calls.
- Keep actions single-purpose and return JSON-serializable data.
- Revalidate all impacted routes after mutations.
- For destructive admin operations, enforce server-side dependency checks and clear Persian error messages.
