# `prisma/` Guidelines

- `schema.prisma` is the source of truth; never edit generated Prisma client files.
- Prefer additive, migration-safe schema changes.
- Update DB changes and dependent app code together (`actions/`, `schemas/`, UI assumptions).
- After schema edits, run migration flow and verify with typecheck/build.
