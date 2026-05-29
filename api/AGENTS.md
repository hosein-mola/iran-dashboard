# `api/` Guidelines

- Keep backend config and thin request helpers here (base URL, headers, wrappers).
- Validate untrusted input at boundaries (reuse `schemas/`).
- Keep secrets and privileged headers server-only.
- Prefer centralized helpers over repeated inline fetch setup.
