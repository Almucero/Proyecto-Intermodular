/**
 * @file: src/backend/modules/games/games.schema.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Esquemas de validación Zod para operaciones de juegos, incluyendo creación, actualización y validación de parámetros.
 */

import { z } from 'zod';

/** Esquema de creación de juego. */
export const createGameSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  price: z.number().nonnegative('El precio debe ser >= 0').optional(),
  salePrice: z
    .number()
    .nonnegative('El precio de venta debe ser >= 0')
    .optional(),
  isOnSale: z.boolean().optional(),
  isRefundable: z.boolean().optional(),
  rating: z.number().min(0).max(10).optional(),
  numberOfSales: z.number().int().nonnegative().optional(),
  stockPc: z.number().int().nonnegative().optional(),
  stockPs5: z.number().int().nonnegative().optional(),
  stockXboxX: z.number().int().nonnegative().optional(),
  stockSwitch: z.number().int().nonnegative().optional(),
  stockPs4: z.number().int().nonnegative().optional(),
  stockXboxOne: z.number().int().nonnegative().optional(),
  videoUrl: z.string().url().optional(),
  publisherId: z.number().int().positive().optional(),
  developerId: z.number().int().positive().optional(),
  releaseDate: z.string().optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
});

/** Esquema de actualización parcial de juego. */
export const updateGameSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  isOnSale: z.boolean().optional(),
  isRefundable: z.boolean().optional(),
  rating: z.number().min(0).max(10).optional(),
  numberOfSales: z.number().int().nonnegative().optional(),
  stockPc: z.number().int().nonnegative().optional(),
  stockPs5: z.number().int().nonnegative().optional(),
  stockXboxX: z.number().int().nonnegative().optional(),
  stockSwitch: z.number().int().nonnegative().optional(),
  stockPs4: z.number().int().nonnegative().optional(),
  stockXboxOne: z.number().int().nonnegative().optional(),
  videoUrl: z.string().url().optional(),
  publisherId: z.number().int().positive().optional(),
  developerId: z.number().int().positive().optional(),
  releaseDate: z.string().optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
});

/** Tipo inferido para creación de juego. */
export type CreateGameInput = z.infer<typeof createGameSchema>;
/** Tipo inferido para actualización de juego. */
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
