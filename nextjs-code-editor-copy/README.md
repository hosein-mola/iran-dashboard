# Next.js Code Editor Page Copy

This folder is a **ported copy** of the existing Vite route `/code-editor` from this repo.
It is intended to be moved into a **Next.js (App Router) project** and used there, while keeping the original page unchanged.

## What’s Included

- `app/code-editor/page.tsx` (App Router route)
- `app/code-editor/CodeEditorClient.tsx` (client wrapper with `ssr: false`)
- `components/code-editor/*` (the full CodeEditor component set)
- `workers/esbuild.worker.ts` (the esbuild-wasm build worker used by the page)
- `lib/api-code.ts` (`runCode()` implemented with `fetch` + `NEXT_PUBLIC_API_BASE_URL`)

## Dependencies To Install In The Next.js Project

At minimum, the page expects these packages to exist:

- `@monaco-editor/react`
- `monaco-editor`
- `framer-motion`
- `esbuild-wasm`
- `acorn`

The UI uses Tailwind utility classes; your Next.js project should have Tailwind configured.

## Notes

- The worker is created via `new Worker(new URL(..., import.meta.url), { type: "module" })`. If your Next.js bundler setup does not handle TypeScript module workers out of the box, you may need to adjust how the worker is bundled/served in your Next project.
- `runCode()` calls `${NEXT_PUBLIC_API_BASE_URL}/v1/code/execute/` (or `/v1/code/execute/` if the env var is not set).

