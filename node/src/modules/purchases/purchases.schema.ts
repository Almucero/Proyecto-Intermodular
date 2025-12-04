import { z } from "zod";

export const checkoutSchema = z.object({
  gameIds: z
    .array(z.number().int().positive())
    .min(1, "Al menos un juego es requerido"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const refundSchema = z.object({
  reason: z
    .string()
    .min(5, "La razón debe tener al menos 5 caracteres")
    .max(500),
});

export type RefundInput = z.infer<typeof refundSchema>;

export const purchaseResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  gameId: z.number(),
  price: z.any(),
  status: z.string(),
  refundReason: z.string().optional(),
  purchasedAt: z.date(),
  game: z
    .object({
      id: z.number(),
      title: z.string(),
      price: z.any().optional(),
      media: z.array(z.any()).optional(),
    })
    .optional(),
});

export type PurchaseResponse = z.infer<typeof purchaseResponseSchema>;
