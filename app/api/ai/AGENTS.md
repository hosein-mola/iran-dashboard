# `app/api/ai/` Guidelines (AI Route Handlers)

Scope: API route handlers under `/api/ai`.

- Keep handlers server-only and route-local; shared provider, database, and SQL logic belongs in `lib/ai-*`.
- Validate every request body and route parameter at the boundary before DB writes or external calls.
- Return JSON for normal responses and Persian user-facing error messages when the UI displays them.
- Do not expose API keys, connection strings, raw provider headers, or privileged SQL Server details in responses.
- Keep cache behavior explicit for health checks, streams, and dynamic AI/database work.
- After adding, removing, or renaming routes, update callers and verify no stale references remain.
