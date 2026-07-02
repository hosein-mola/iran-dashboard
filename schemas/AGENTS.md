# `schemas/` Guidelines

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- Use Zod as the validation source of truth.
- Export descriptive, reusable schema/types (`XSchema`, `XInput`, `XOutput`).
- Keep coercion/defaults explicit so server and UI interpret values the same way.
- When schema shape changes, update dependent actions/routes/forms in the same diff.
