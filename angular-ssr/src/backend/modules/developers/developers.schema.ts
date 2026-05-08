import { z } from 'zod';

/** Esquema de creación de desarrollador. */
export const createDeveloperSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

/** Esquema de actualización de desarrollador. */
export const updateDeveloperSchema = z.object({
  name: z.string().min(1).optional(),
});

/** Tipo inferido para creación de desarrollador. */
export type CreateDeveloperInput = z.infer<typeof createDeveloperSchema>;
/** Tipo inferido para actualización de desarrollador. */
export type UpdateDeveloperInput = z.infer<typeof updateDeveloperSchema>;
