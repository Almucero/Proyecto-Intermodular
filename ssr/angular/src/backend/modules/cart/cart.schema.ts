import { z } from "zod";

export const addToCartSchema = z.object({
  gameId: z.number().int().positive("gameId debe ser un número positivo"),
  quantity: z
    .number()
    .int()
    .positive("quantity debe ser al menos 1")
    .default(1),
  platformId: z
    .number()
    .int()
    .positive("platformId debe ser un número positivo"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartQuantitySchema = z.object({
  quantity: z.number().int().positive("quantity debe ser al menos 1"),
  platformId: z
    .number()
    .int()
    .positive("platformId debe ser un número positivo"),
});

export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;

export const cartItemResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  gameId: z.number(),
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;
