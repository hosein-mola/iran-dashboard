# `components/ui/` Guidelines (shadcn/ui primitives)

- Treat these as shared primitives: keep props and behavior stable.
- Avoid adding app-specific business logic here; create wrappers in `components/` instead.
- Follow existing `class-variance-authority` patterns when adding variants.
- Prefer small, localized changes to fix styling/accessibility; do not redesign primitives.
