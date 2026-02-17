import { z } from 'zod';

export const createPublisherSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export const updatePublisherSchema = z.object({
  name: z.string().min(1).optional(),
});

export type CreatePublisherInput = z.infer<typeof createPublisherSchema>;
export type UpdatePublisherInput = z.infer<typeof updatePublisherSchema>;
