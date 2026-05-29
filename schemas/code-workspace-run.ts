import { z } from 'zod'

export const runCodeWorkspaceVersionSchema = z.object({
  entryPath: z.string().min(1).max(512).optional(),
  functionName: z.string().min(1).max(128),
  args: z.array(z.any()).max(50).optional(),
  data: z.any().optional(),
  timeoutMs: z.number().int().min(50).max(30_000).optional(),
})

export type RunCodeWorkspaceVersionInput = z.infer<
  typeof runCodeWorkspaceVersionSchema
>
