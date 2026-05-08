import { z } from 'zod';

/** Esquema de creación de plataforma. */
export const createPlatformSchema = z.object({
  name: z.string().min(1, 'El nombre de la plataforma es requerido'),
});

/** Esquema de actualización de plataforma. */
export const updatePlatformSchema = z.object({
  name: z.string().min(1, 'El nombre de la plataforma es requerido').optional(),
});

/** Tipo inferido para creación de plataforma. */
export type CreatePlatformInput = z.infer<typeof createPlatformSchema>;
/** Tipo inferido para actualización de plataforma. */
export type UpdatePlatformInput = z.infer<typeof updatePlatformSchema>;
