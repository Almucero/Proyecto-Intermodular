import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { prisma } from "../../config/db.js";
import type { ChatInput } from "./chat.schema.js";

export async function processChatStream(input: ChatInput) {
  const systemPrompt = `
    Eres el asistente virtual experto de la tienda "GameSage".
    Tu objetivo es ayudar a usuarios a encontrar juegos en nuestro catálogo.
    
    TIENES ACCESO A UNA HERRAMIENTA LLAMADA 'searchGames'.
    - Si el usuario pregunta por un género, usa la herramienta con el nombre del género.
    - Si pregunta por un juego específico, busca por el título.
    - Si pregunta "¿qué tienes?" o "¿qué recomiendas?", busca términos generales como "acción" o "aventura".
    - Si saluda, responde amablemente sin usar herramientas.
    
    Cuando encuentres juegos, menciona el precio y plataformas.
    Si la búsqueda no da resultados, dilo honestamente.
  `;

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: input.messages.slice(-5),
    // @ts-ignore
    maxSteps: 5,
    tools: {
      searchGames: tool({
        description:
          "Busca videojuegos en la base de datos por nombre, género o descripción.",
        parameters: z.object({
          query: z
            .string()
            .describe('El término de búsqueda, ej: "RPG", "Mario", "Barato"'),
        }) as any,
        // @ts-ignore
        execute: async ({ query }: { query: string }) => {
          const games = await prisma.game.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                {
                  genres: {
                    some: { name: { contains: query, mode: "insensitive" } },
                  },
                },
              ],
            },
            take: 5,
            orderBy: { id: "desc" },
            select: {
              id: true,
              title: true,
              price: true,
              description: true,
              genres: { select: { name: true } },
              platforms: { select: { name: true } },
            },
          });

          return JSON.stringify(games);
        },
      }),
    },
  });

  return result;
}
