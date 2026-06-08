# `status/` Guidelines

Scope: AI database connection health checks.

- Keep this route dynamic and side-effect-light; it should only check connectivity.
- Check SQLite and SQL Server independently so one failure does not hide the other result.
- Do not return connection strings or credentials; only return configured/connected flags, provider, message, and safe target metadata.
- Keep SQL Server health checks in `lib/ai-database-chat` and Prisma health checks route-local unless reused elsewhere.
