# `app/api/ai/database-chat/` Guidelines

Scope: database chat conversations, schemas, status checks, and message streaming.

- Use Prisma models `AiDatabaseSchema`, `AiDbChatConversation`, and `AiDbChatMessage` as the persistence contract.
- Reuse `normalizeRowLimit`, `normalizeMessageQuota`, `DATABASE_CHAT_HISTORY_LIMIT`, and `answerDatabaseQuestion` from `lib/ai-database-chat`.
- Keep generated SQL constrained to the shared helper flow; route handlers should not execute ad hoc SQL directly.
- Preserve the single read-only query safety model: SELECT/WITH only, no semicolons, no mutations, no schema changes.
- Keep row limits capped and quotas enforced server-side; message sends reserve room for both user and assistant messages.
- In Next.js 16 route handlers, treat `context.params` as a promise and `await` it before reading values.
- When stream event shapes change, update the UI `ChatStreamEvent` union and parsing at the same time.
