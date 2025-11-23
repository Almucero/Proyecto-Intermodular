import { z } from "zod";

// Schema for uploading a new image (multipart/form-data fields)
export const uploadGameImageSchema = z.object({
  gameId: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "gameId debe ser un número válido",
    }),
  altText: z.string().optional(),
});

// Schema for updating an image (multipart/form-data fields)
export const updateGameImageSchema = z.object({
  gameId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "gameId debe ser un número válido",
    }),
  altText: z.string().optional(),
});

export type UploadGameImageInput = z.infer<typeof uploadGameImageSchema>;
export type UpdateGameImageInput = z.infer<typeof updateGameImageSchema>;
