import { z } from 'zod';

/** Esquema de entrada para enviar un mensaje al asistente. */
export const chatInputSchema = z.object({
  sessionId: z.number().int().positive().optional(),
  message: z.string().min(1, 'El mensaje no puede estar vacío'),
});

/** Tipo inferido para entrada de chat. */
export type ChatInput = z.infer<typeof chatInputSchema>;

/** Esquema para validar `id` de sesión en params. */
export const sessionIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID debe ser un número positivo'),
});
