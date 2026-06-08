# `lib/` Guidelines

- Keep utilities focused and dependency-light; avoid circular imports.
- Split server-only helpers from client-safe helpers.
- Use shared `cn()` for class composition instead of duplicating merge helpers.
- Prefer pure function exports; isolate mutable/singleton state to explicit modules only.

## AI Database Chat Helpers

- Keep AI provider/model options centralized in `ai-model-options.ts`.
- Keep SQL Server connection parsing, query safety, prompt construction, and streaming provider calls in `ai-database-chat.ts`.
- Preserve read-only SQL enforcement and row/quota normalization when changing database chat behavior.
- Do not expose provider API keys, SQL Server credentials, or raw connection strings from helper return values.
