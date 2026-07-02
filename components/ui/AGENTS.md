# `components/ui/` Guidelines (shadcn Primitives)

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- Keep primitives generic and API-stable.
- No app-specific business logic here; build wrappers in `components/`.
- Follow existing `class-variance-authority` and `cn()` patterns.
- Make accessibility/style fixes locally (focus, keyboard, ARIA) without broad redesign.
