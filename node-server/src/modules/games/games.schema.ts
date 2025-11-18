import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  price: z.number().nonnegative("El precio debe ser >= 0").optional(),
  salePrice: z
    .number()
    .nonnegative("El precio de venta debe ser >= 0")
    .optional(),
  isOnSale: z.boolean().optional(),
  isRefundable: z.boolean().optional(),
  rating: z.number().min(0).max(10).optional(),
  numberOfSales: z.number().int().nonnegative().optional(),
  publisherId: z.number().int().positive().optional(),
  developerId: z.number().int().positive().optional(),
  releaseDate: z.string().optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
});

export const updateGameSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  isOnSale: z.boolean().optional(),
  isRefundable: z.boolean().optional(),
  rating: z.number().min(0).max(10).optional(),
  numberOfSales: z.number().int().nonnegative().optional(),
  publisherId: z.number().int().positive().optional(),
  developerId: z.number().int().positive().optional(),
  releaseDate: z.string().optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
