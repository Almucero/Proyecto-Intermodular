/**
 * @file: src/backend/modules/cart/cart.schema.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Esquemas de validación Zod para operaciones de carrito, incluyendo adición, actualización y serialización de respuesta.
 */

import { z } from 'zod';

/** Esquema para añadir un juego al carrito. */
export const addToCartSchema = z.object({
  gameId: z.number().int().positive('gameId debe ser un número positivo'),
  quantity: z
    .number()
    .int()
    .positive('quantity debe ser al menos 1')
    .default(1),
  platformId: z
    .number()
    .int()
    .positive('platformId debe ser un número positivo'),
});

/** Tipo inferido del payload para añadir al carrito. */
export type AddToCartInput = z.infer<typeof addToCartSchema>;

/** Esquema para actualizar cantidad de un item de carrito. */
export const updateCartQuantitySchema = z.object({
  quantity: z.number().int().positive('quantity debe ser al menos 1'),
  platformId: z
    .number()
    .int()
    .positive('platformId debe ser un número positivo'),
});

/** Tipo inferido del payload para actualizar cantidad. */
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;

/** Esquema de respuesta serializada de item de carrito. */
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

/** Tipo inferido de respuesta de item de carrito. */
export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;
