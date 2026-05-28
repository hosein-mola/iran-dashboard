import { z } from 'zod'

export const formSchemea = z.object({
  name: z.string().min(4),
  description: z.string().optional(),
  scheduleType: z.enum(['hourly', 'weekly', 'monthly']).default('monthly'),
  scheduleInterval: z.coerce.number().int().positive().default(1),
  submoduleId: z.coerce.number().int().positive().optional(),
  roleId: z.coerce.number().int().positive().optional(),
  assignedUserId: z.string().optional(),
  templateId: z.coerce.number().int().positive().optional(),
})

export type formSchemaType = z.infer<typeof formSchemea>
