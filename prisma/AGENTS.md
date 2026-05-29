# `prisma/` Guidelines

- Keep `schema.prisma` as the source of truth; do not edit generated client output.
- Prefer additive, migration-friendly changes.
- If schema changes are required, ensure migrations and dependent code are updated together.
