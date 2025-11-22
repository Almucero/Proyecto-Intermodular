import { z } from "zod";

export const createPlatformSchema = z.object({
  name: z.string().min(1, "El nombre de la plataforma es requerido"),
});

export const updatePlatformSchema = z.object({
  name: z.string().min(1, "El nombre de la plataforma es requerido").optional(),
});

export type CreatePlatformInput = z.infer<typeof createPlatformSchema>;
export type UpdatePlatformInput = z.infer<typeof updatePlatformSchema>;
