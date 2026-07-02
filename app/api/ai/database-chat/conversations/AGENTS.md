# `conversations/` Guidelines

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

Scope: listing and creating AI database chat conversations.

- List conversations newest-first and include enough schema metadata for the sidebar without requiring extra UI fetches.
- Only create conversations for active schemas; reject missing or inactive schema IDs before writing.
- Keep serialized dates as ISO strings and message counts from Prisma `_count`.
- Keep titles deterministic; if callers provide a custom title, validate and trim it.
- On response shape changes, update `AiDatabaseChatClient` conversation list and active conversation types.
