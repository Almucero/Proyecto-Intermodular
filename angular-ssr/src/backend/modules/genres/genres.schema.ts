import { z } from 'zod';

export const createGenreSchema = z.object({
  name: z.string().min(1, 'El nombre del género es requerido'),
});

export const updateGenreSchema = z.object({
  name: z.string().min(1, 'El nombre del género es requerido').optional(),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
