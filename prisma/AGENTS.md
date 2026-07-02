# `prisma/` Guidelines

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- `schema.prisma` is the source of truth; never edit generated Prisma client files.
- Prefer additive, migration-safe schema changes.
- Update DB changes and dependent app code together (`actions/`, `schemas/`, UI assumptions).
- After schema edits, run migration flow and verify with typecheck/build.
