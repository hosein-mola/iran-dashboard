import { z } from "zod";

export const formSchemea = z.object({
    name: z.string().min(4),
    description: z.string().optional(),
});

export type formSchemaType = z.infer<typeof formSchemea>;
