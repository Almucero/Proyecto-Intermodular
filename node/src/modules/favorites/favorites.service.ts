import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/errors.js";

/**
 * Agregar juego a favoritos
 */
export async function addToFavorites(userId: number, gameId: number) {
  // Verificar que el juego existe
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true },
  });

  if (!game) {
    throw new AppError("Juego no encontrado", 404);
  }

  try {
    return await prisma.favorite.create({
      data: { userId, gameId },
      select: {
        id: true,
        userId: true,
        gameId: true,
        createdAt: true,
        game: {
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            media: {
              select: {
                id: true,
                url: true,
                publicId: true,
                format: true,
                resourceType: true,
                bytes: true,
                width: true,
                height: true,
                originalName: true,
                folder: true,
                altText: true,
              },
              take: 1,
            },
          },
        },
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("Este juego ya está en favoritos", 409);
    }
    throw error;
  }
}

/**
 * Remover juego de favoritos
 */
export async function removeFromFavorites(userId: number, gameId: number) {
  try {
    await prisma.favorite.delete({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
    return { message: "Juego removido de favoritos" };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new AppError("Favorito no encontrado", 404);
    }
    throw error;
  }
}

/**
 * Obtener favoritos del usuario
 */
export async function getUserFavorites(userId: number) {
  return prisma.favorite.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      gameId: true,
      createdAt: true,
      game: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          rating: true,
          releaseDate: true,
          media: {
            select: {
              id: true,
              url: true,
              publicId: true,
              format: true,
              resourceType: true,
              bytes: true,
              width: true,
              height: true,
              originalName: true,
              folder: true,
              altText: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Verificar si un juego está en favoritos
 */
export async function isFavorite(userId: number, gameId: number) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  return !!favorite;
}
