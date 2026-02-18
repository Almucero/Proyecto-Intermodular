import { google } from '@ai-sdk/google';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { prisma } from '../../config/db';

const searchGamesInputSchema = z.object({
  query: z
    .string()
    .describe(
      'El término de búsqueda. Si es genérico usa "accion" o "aventura" por ejemplo',
    ),
});

interface GameResult {
  id: number;
  title: string;
  price: string;
  genres: string;
  platforms: string;
}

export async function getUserSessions(userId: number) {
  return prisma.chatSession.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getSession(sessionId: number, userId: number) {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        select: {
          id: true,
          role: true,
          content: true,
          games: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!session) {
    throw new Error('Sesión no encontrada');
  }
  return session;
}

export async function deleteSession(sessionId: number, userId: number) {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) {
    throw new Error('Sesión no encontrada');
  }
  await prisma.chatSession.delete({ where: { id: sessionId } });
  return { deleted: true };
}

export async function processChat(
  userId: number,
  message: string,
  sessionId?: number,
) {
  const foundGames: GameResult[] = [];

  let session: { id: number; title: string | null };

  if (sessionId) {
    const existing = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true, title: true },
    });
    if (!existing) {
      throw new Error('Sesión no encontrada');
    }
    session = existing;
  } else {
    session = await prisma.chatSession.create({
      data: {
        userId,
        title: message.slice(0, 50),
      },
      select: { id: true, title: true },
    });
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role: 'user',
      content: message,
    },
  });

  const previousMessages = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    take: 10,
    select: { role: true, content: true },
  });

  const systemPrompt = `
    Eres el asistente virtual experto de la tienda "GameSage", llamado "Sage".
    Tu objetivo es ayudar a usuarios a encontrar juegos en nuestro catálogo.
    
    TIENES ACCESO A UNA HERRAMIENTA LLAMADA 'searchGames'.
    - Si el usuario pregunta por un género, usa la herramienta con el nombre del género.
    - Si pregunta por un juego específico, busca por el título.
    - Si pregunta "¿qué tienes?", "¿qué recomiendas?" o similar, busca términos generales como "accion" o "aventura", NUNCA envíes "undefined" o dejes el campo vacío.
    - Si saluda, responde amablemente sin usar herramientas.

    IMPORTANTE:
    - SIEMPRE empieza tu respuesta con una frase amable o conversacional antes de listar los juegos (ej: "¡Claro! Aquí tienes algunas opciones interesantes:", "¡Por supuesto! He encontrado estos títulos para ti:").
    - SOLO puedes recomendar juegos que la herramienta 'searchGames' te haya devuelto. NO inventes juegos ni recomiendes títulos que no estén en la respuesta de la herramienta.
    - Si la herramienta devuelve una lista vacía, di honestamente que no tenemos juegos de ese tipo en este momento.
    - Cuando encuentres juegos, menciona el nombre, una descripción breve, precio y plataformas. Usa un formato limpio (viñetas o negritas).
    - En tus respuestas no hagas referencia textual a la herramienta "searchGames".
    - Mantén un tono entusiasta y servicial, como un vendedor experto y gamer.
    - Te pueden llegar a hablar en cualquiera de es estos idiomas, por lo que responde acorde: Español, Ingles, Frances, Italiano, Aleman.
  `;

  const messages = previousMessages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }),
  );

  const tools = {
    searchGames: tool({
      description:
        'Busca videojuegos en la base de datos por nombre, género o descripción.',
      inputSchema: searchGamesInputSchema,
      execute: async ({ query }) => {
        const cleanQuery = query === 'undefined' || !query ? '' : query.trim();
        try {
          const whereClause: any =
            cleanQuery === ''
              ? {}
              : {
                  OR: [
                    { title: { contains: cleanQuery, mode: 'insensitive' } },
                    {
                      description: {
                        contains: cleanQuery,
                        mode: 'insensitive',
                      },
                    },
                    {
                      genres: {
                        some: {
                          name: { contains: cleanQuery, mode: 'insensitive' },
                        },
                      },
                    },
                  ],
                };
          const games = await prisma.game.findMany({
            where: whereClause,
            take: 5,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              title: true,
              price: true,
              genres: { select: { name: true } },
              platforms: { select: { name: true } },
            },
          });
          if (games.length === 0) {
            return 'No se encontraron juegos con ese criterio.';
          }
          const gamesList = games.map((g: any) => ({
            id: g.id,
            title: g.title,
            price: g.price ? g.price.toString() : 'N/A',
            genres: g.genres
              .map((gen: { name: string }) => gen.name)
              .join(', '),
            platforms: g.platforms
              .map((p: { name: string }) => p.name)
              .join(', '),
          }));
          foundGames.push(...gamesList);
          return JSON.stringify(gamesList);
        } catch {
          return 'Error técnico al buscar en la base de datos.';
        }
      },
    }),
  };

  let result;

  try {
    result = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
      stopWhen: stepCountIs(5),
      tools,
    });
  } catch (error) {
    try {
      result = await generateText({
        model: google('gemini-1.5-flash'),
        system: systemPrompt,
        messages,
        stopWhen: stepCountIs(5),
        tools,
      });
    } catch (error2) {
      result = {
        text: 'Lo siento, he alcanzado mi límite diario de consultas. Por favor, inténtalo de nuevo mañana.',
      };
    }
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: result.text,
      games: foundGames.length > 0 ? (foundGames as any) : undefined,
    },
  });

  return {
    sessionId: session.id,
    text: result.text,
    games: foundGames,
  };
}
