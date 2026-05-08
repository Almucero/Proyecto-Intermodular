import { z } from 'zod';

/** Esquema para subida de media multipart. */
export const uploadMediaSchema = z.object({
  type: z.enum(['user', 'game']),
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: 'id debe ser un número válido',
    }),
  altText: z.string().optional(),
});

/** Esquema para actualización de media multipart. */
export const updateMediaSchema = z.object({
  type: z.enum(['user', 'game']).optional(),
  id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'id debe ser un número válido',
    }),
  altText: z.string().optional(),
});

/** Tipo inferido para subida de media. */
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
/** Tipo inferido para actualización de media. */
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
