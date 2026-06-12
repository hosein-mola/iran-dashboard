import { z } from 'zod'

export const runCodeWorkspaceVersionSchema = z.object({
  entryPath: z.string().min(1).max(512).optional(),
  functionName: z.string().min(1).max(128),
  data: z.any().optional(),
  timeoutMs: z.number().int().min(100).max(60_000).optional(),
})

export type RunCodeWorkspaceVersionInput = z.infer<
  typeof runCodeWorkspaceVersionSchema
>
