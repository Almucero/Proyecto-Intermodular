import { z } from "zod";

// Schema for uploading a new media (multipart/form-data fields)
export const uploadMediaSchema = z.object({
  type: z.enum(["user", "game"]),
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "id debe ser un número válido",
    }),
  altText: z.string().optional(),
});

// Schema for updating media (multipart/form-data fields)
export const updateMediaSchema = z.object({
  type: z.enum(["user", "game"]).optional(),
  id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "id debe ser un número válido",
    }),
  altText: z.string().optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
