# `actions/` Guidelines (Server Actions)

- Keep actions server-only; no browser-only APIs.
- Validate inputs (prefer schemas in `schemas/`) before writing to DB or calling external services.
- Return plain JSON-serializable values (no class instances).
- Keep actions narrowly scoped (one purpose); prefer composing in higher-level callers instead of giant actions.
