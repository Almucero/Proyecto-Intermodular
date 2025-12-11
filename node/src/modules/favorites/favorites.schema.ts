import { z } from "zod";

export const addToFavoritesSchema = z.object({
  gameId: z.number().int().positive("gameId debe ser un número positivo"),
  platformId: z
    .number()
    .int()
    .positive("platformId debe ser un número positivo"),
});

export type AddToFavoritesInput = z.infer<typeof addToFavoritesSchema>;

export const favoriteResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  gameId: z.number(),
  createdAt: z.date(),
  game: z
    .object({
      id: z.number(),
      title: z.string(),
      price: z.any().optional(),
      media: z.array(z.any()).optional(),
    })
    .optional(),
  platform: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
});

export type FavoriteResponse = z.infer<typeof favoriteResponseSchema>;
