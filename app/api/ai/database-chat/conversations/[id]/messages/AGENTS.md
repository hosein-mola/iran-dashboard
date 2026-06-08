# `messages/` Guidelines

Scope: sending a user message and streaming the assistant response.

- Keep the response as newline-delimited JSON with `application/x-ndjson; charset=utf-8`.
- Preserve stream events: `status`, `message`, `assistantMeta`, `assistantDelta`, `done`, and `error`.
- Write the user message before AI execution and the assistant message only after the final answer is available.
- Pass recent conversation history through `DATABASE_CHAT_HISTORY_LIMIT`; do not load unbounded history into provider prompts.
- Normalize the selected model ID with `normalizeAiModelOptionId` before calling shared AI helpers.
- If quota rules change, update the sidebar quota display and server enforcement together.
