# `app/(modules)/ai/` Guidelines (AI Database Chat UI)

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

Scope: the AI module screen and route-local client components.

- Keep `page.tsx` as the server data-loading boundary; put browser state, effects, streaming reads, and form state in client components.
- Keep UI payload types aligned with `app/api/ai/database-chat/**` response and stream event shapes.
- Preserve Persian RTL copy and predictable dashboard ergonomics; do not turn this module into a marketing-style page.
- Keep the chat layout height-bounded and overflow-safe across desktop and mobile.
- Use model options from `lib/ai-model-options`; do not duplicate provider/model lists in UI code.
- When changing schema defaults, row limits, quotas, or conversation fields, update initial hydration, fetch handlers, and stream rendering in the same diff.
- Verify UI route changes with `npx tsc --noEmit`; if route types are stale, clear `.next` and rerun.
