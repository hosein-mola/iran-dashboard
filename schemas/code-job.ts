import { z } from 'zod'

export const createCodeJobSchema = z.object({
  workspaceSlug: z.string().min(1).max(128),
  version: z.number().int().positive(),
  entryPath: z.string().min(1).max(512),
  functionName: z.string().min(1).max(128),
  data: z.any().optional(),
  queue: z.string().min(1).max(80).default('default').optional(),
  priority: z.number().int().min(-100).max(100).default(0).optional(),
  timeoutMs: z.number().int().min(100).max(60_000).default(30_000).optional(),
  maxAttempts: z.number().int().min(1).max(10).default(1).optional(),
  runNow: z.boolean().default(true).optional(),
})

export const codeWorkerControlSchema = z.object({
  action: z.enum(['start', 'pause', 'resume', 'stop']),
  workerCount: z.number().int().min(1).max(8).default(2).optional(),
  queue: z.string().min(1).max(80).default('default').optional(),
})

export const codeJobActionSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel', 'retry']),
})

export type CreateCodeJobInput = z.infer<typeof createCodeJobSchema>
export type CodeWorkerControlInput = z.infer<typeof codeWorkerControlSchema>
export type CodeJobActionInput = z.infer<typeof codeJobActionSchema>
