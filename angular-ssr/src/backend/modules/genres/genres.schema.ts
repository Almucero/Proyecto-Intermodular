import { z } from 'zod';

/** Esquema de creación de género. */
export const createGenreSchema = z.object({
  name: z.string().min(1, 'El nombre del género es requerido'),
});

/** Esquema de actualización de género. */
export const updateGenreSchema = z.object({
  name: z.string().min(1, 'El nombre del género es requerido').optional(),
});

/** Tipo inferido para creación de género. */
export type CreateGenreInput = z.infer<typeof createGenreSchema>;
/** Tipo inferido para actualización de género. */
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
