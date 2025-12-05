import { z } from "zod";

export const addToCartSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive("quantity debe ser al menos 1")
    .default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartQuantitySchema = z.object({
  quantity: z.number().int().positive("quantity debe ser al menos 1"),
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
});

export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;
