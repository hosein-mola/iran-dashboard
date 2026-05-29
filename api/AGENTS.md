# `api/` Guidelines

- Keep API configuration/helpers here (base URLs, shared headers, client wrappers).
- Validate all untrusted inputs (prefer schemas in `schemas/`).
- Avoid leaking secrets into client bundles; keep secret usage server-only.
