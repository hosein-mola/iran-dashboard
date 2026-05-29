# `lib/` Guidelines

- Keep utilities small and focused; avoid circular dependencies.
- Split server-only helpers from client-safe helpers when needed.
- Prefer exporting functions over mutable singletons (except well-contained cases like Prisma client helpers).
