import { z } from 'zod';

export const chatInputSchema = z.object({
  sessionId: z.number().int().positive().optional(),
  message: z.string().min(1, 'El mensaje no puede estar vacío'),
});

export type ChatInput = z.infer<typeof chatInputSchema>;

export const sessionIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID debe ser un número positivo'),
});
