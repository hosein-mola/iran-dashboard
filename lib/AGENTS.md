# `lib/` Guidelines

- Keep utilities focused and dependency-light; avoid circular imports.
- Split server-only helpers from client-safe helpers.
- Use shared `cn()` for class composition instead of duplicating merge helpers.
- Prefer pure function exports; isolate mutable/singleton state to explicit modules only.
