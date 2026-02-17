import { z } from "zod";

export const createDeveloperSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export const updateDeveloperSchema = z.object({
  name: z.string().min(1).optional(),
});

export type CreateDeveloperInput = z.infer<typeof createDeveloperSchema>;
export type UpdateDeveloperInput = z.infer<typeof updateDeveloperSchema>;
