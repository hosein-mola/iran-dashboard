# `api/` Guidelines

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- Keep backend config and thin request helpers here (base URL, headers, wrappers).
- Validate untrusted input at boundaries (reuse `schemas/`).
- Keep secrets and privileged headers server-only.
- Prefer centralized helpers over repeated inline fetch setup.
