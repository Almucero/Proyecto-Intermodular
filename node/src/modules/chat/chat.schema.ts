import { z } from "zod";

export const chatInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export type ChatInput = z.infer<typeof chatInputSchema>;
