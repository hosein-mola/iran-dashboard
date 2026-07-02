# `conversations/[id]/` Guidelines

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

Scope: loading a single AI database chat conversation.

- Always load messages in ascending `createdAt` order for stable chat rendering.
- Include schema name, row limit, quota, message count, and ISO timestamps in the serialized conversation.
- Return a clear 404 JSON response when the conversation does not exist.
- Keep message serialization compatible with the message stream route and client `ChatMessage` type.
