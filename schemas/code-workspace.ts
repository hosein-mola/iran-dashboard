import { z } from 'zod'

const workspacePathSchema = z
  .string()
  .trim()
  .min(2)
  .max(1024)
  .regex(/^\//, 'Path must start with /')

const workspaceFileSchema = z.object({
  path: workspacePathSchema,
  content: z.string().max(500_000),
  language: z
    .enum(['typescript', 'javascript', 'markdown', 'json', 'plaintext'])
    .optional(),
  updatedAt: z.string().datetime().optional(),
})

export const codeWorkspaceSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    entryPath: workspacePathSchema,
    files: z.array(workspaceFileSchema).max(2_000),
  })
  .passthrough()

export const createCodeWorkspaceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2_000).optional(),
  initialSnapshot: codeWorkspaceSnapshotSchema.optional(),
})

export const saveCodeWorkspaceVersionSchema = z.object({
  snapshot: codeWorkspaceSnapshotSchema,
  message: z.string().trim().max(2000).optional(),
  isAutosave: z.boolean().optional(),
  clientRequestId: z.string().min(8).max(128).optional(),
})

export type CodeWorkspaceSnapshotInput = z.infer<typeof codeWorkspaceSnapshotSchema>
export type CreateCodeWorkspaceInput = z.infer<typeof createCodeWorkspaceSchema>
export type SaveCodeWorkspaceVersionInput = z.infer<
  typeof saveCodeWorkspaceVersionSchema
>
