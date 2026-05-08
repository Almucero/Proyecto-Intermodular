import { z } from 'zod';

/** Esquema para añadir un juego a favoritos. */
export const addToFavoritesSchema = z.object({
  gameId: z.number().int().positive('gameId debe ser un número positivo'),
  platformId: z
    .number()
    .int()
    .positive('platformId debe ser un número positivo'),
});

/** Tipo inferido del payload para añadir a favoritos. */
export type AddToFavoritesInput = z.infer<typeof addToFavoritesSchema>;

/** Esquema de respuesta serializada de favorito. */
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

/** Tipo inferido de respuesta de favorito. */
export type FavoriteResponse = z.infer<typeof favoriteResponseSchema>;
