# `schemas/` Guidelines

- Use Zod as the validation source of truth.
- Export descriptive, reusable schema/types (`XSchema`, `XInput`, `XOutput`).
- Keep coercion/defaults explicit so server and UI interpret values the same way.
- When schema shape changes, update dependent actions/routes/forms in the same diff.
