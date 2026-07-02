# `schemas/` Guidelines

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

Scope: listing and creating database schemas for AI chat.

- Validate schema payloads with Zod and parse `schemaJson` before storing it.
- Normalize row limits and message quotas before persistence; keep defaults aligned with `lib/ai-database-chat`.
- Return active schemas newest-first with ISO `updatedAt` strings.
- Keep schema JSON as user-editable text, but never trust it without validation at write boundaries.
- When schema fields change, update create, patch, page hydration, and client form state in the same diff.
