import { z } from 'zod'

// Snapshot is the CodeEditor FileSystem object (stored as JSON).
// Keep it permissive to allow forward-compatible UI changes.
export const codeWorkspaceSnapshotSchema = z.record(z.any())

export const saveCodeWorkspaceVersionSchema = z.object({
  snapshot: codeWorkspaceSnapshotSchema,
  message: z.string().max(2000).optional(),
  isAutosave: z.boolean().optional(),
  clientRequestId: z.string().min(8).max(128).optional(),
})

export type SaveCodeWorkspaceVersionInput = z.infer<
  typeof saveCodeWorkspaceVersionSchema
>

