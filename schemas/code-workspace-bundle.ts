import { z } from 'zod'

// Bundled JS output (esbuild) persisted per workspace version.
// Stored server-side in CodeWorkspaceVersion.meta JSON.
export const saveCodeWorkspaceBundleSchema = z.object({
  entryPath: z.string().min(1).max(512),
  code: z.string().min(1).max(2_000_000),
})

export type SaveCodeWorkspaceBundleInput = z.infer<
  typeof saveCodeWorkspaceBundleSchema
>

