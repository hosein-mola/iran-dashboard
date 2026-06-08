# `schemas/[id]/` Guidelines

Scope: updating a stored AI database schema.

- Use partial updates only for provided fields; preserve existing values when a field is omitted.
- Parse provided `schemaJson` before saving and return a Persian validation error on invalid JSON.
- Normalize row limits and message quotas on every update.
- Keep the response shape identical to schema creation unless there is a deliberate client update.
