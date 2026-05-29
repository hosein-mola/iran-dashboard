# `schemas/` Guidelines

- Use Zod schemas for validation/coercion.
- Keep schema names descriptive and exportable (used by `actions/`, route handlers, and UI forms).
- When changing schema shape, update all call sites that depend on it.
