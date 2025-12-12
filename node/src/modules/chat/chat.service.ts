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
    - Si pregunta "¿qué tienes?", "¿qué recomiendas?" o similar, busca términos generales como "accion" o "aventura", NUNCA envíes "undefined" o dejes el campo vacío.
    - Si saluda, responde amablemente sin usar herramientas.

    IMPORTANTE:
    - Si vas a usar la herramienta, PRIMERO di una frase corta como "Voy a buscar eso en el catálogo..." y LUEGO ejecutala.
    
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
            .describe(
              'El término de búsqueda, Si es genérico usa "accion" o "aventura" por ejemplo'
            ),
        }) as any,
        // @ts-ignore
        execute: async ({ query }: { query: string }) => {
          const cleanQuery =
            query === "undefined" || !query ? "" : query.trim();
          console.log(`🔧 Tool ejecutándose con query: "${cleanQuery}"`);
          try {
            const whereClause =
              cleanQuery === ""
                ? {}
                : {
                    OR: [
                      { title: { contains: cleanQuery, mode: "insensitive" } },
                      {
                        description: {
                          contains: cleanQuery,
                          mode: "insensitive",
                        },
                      },
                      {
                        genres: {
                          some: {
                            name: { contains: cleanQuery, mode: "insensitive" },
                          },
                        },
                      },
                    ],
                  };
            const games = await prisma.game.findMany({
              where: whereClause,
              take: 5,
              orderBy: { id: "desc" },
              select: {
                title: true,
                price: true,
                description: true,
                genres: { select: { name: true } },
                platforms: { select: { name: true } },
              },
            });
            console.log(`✅ Juegos encontrados: ${games.length}`);
            if (games.length === 0) {
              return "No se encontraron juegos en el catálogo con ese criterio.";
            }
            return JSON.stringify(games);
          } catch (error) {
            console.error("❌ Error en searchGames:", error);
            return "Hubo un error técnico al buscar en la base de datos.";
          }
        },
      }),
    },
  });

  return result;
}
