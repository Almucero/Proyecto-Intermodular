import { z } from "zod";

export const createGameImageSchema = z.object({
  gameId: z.number().int().positive("El ID del juego es requerido"),
  url: z.string().url("URL debe ser válida"),
  altText: z.string().optional(),
});

export const updateGameImageSchema = z.object({
  url: z.string().url("URL debe ser válida").optional(),
  altText: z.string().optional(),
});

export type CreateGameImageInput = z.infer<typeof createGameImageSchema>;
export type UpdateGameImageInput = z.infer<typeof updateGameImageSchema>;
