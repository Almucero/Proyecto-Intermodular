import { z } from 'zod';

/** Esquema de checkout con ids de items de carrito. */
export const checkoutSchema = z.object({
  cartItemIds: z
    .array(z.number().int().positive())
    .min(1, 'Al menos un artículo del carrito es requerido'),
});

/** Tipo inferido del payload de checkout. */
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Esquema de solicitud de reembolso. */
export const refundSchema = z.object({
  reason: z
    .string()
    .min(5, 'La razón debe tener al menos 5 caracteres')
    .max(500),
});

/** Tipo inferido del payload de reembolso. */
export type RefundInput = z.infer<typeof refundSchema>;

/** Esquema de respuesta serializada de compra. */
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
  platform: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
});

/** Tipo inferido de respuesta de compra. */
export type PurchaseResponse = z.infer<typeof purchaseResponseSchema>;
