# `components/ui/` Guidelines (shadcn Primitives)

- Keep primitives generic and API-stable.
- No app-specific business logic here; build wrappers in `components/`.
- Follow existing `class-variance-authority` and `cn()` patterns.
- Make accessibility/style fixes locally (focus, keyboard, ARIA) without broad redesign.
