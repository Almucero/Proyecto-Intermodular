import { prisma } from "../../config/db.js";

export async function addToFavorites(userId: number, gameId: number) {
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
}

export async function removeFromFavorites(userId: number, gameId: number) {
  await prisma.favorite.delete({
    where: {
      userId_gameId: { userId, gameId },
    },
  });
  return { message: "Juego removido de favoritos" };
}

export async function getUserFavorites(userId: number) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      game: {
        select: {
          id: true,
          title: true,
          price: true,
          isOnSale: true,
          salePrice: true,
          rating: true,
          Developer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((fav) => ({
    favoriteId: fav.id,
    favoritedAt: fav.createdAt,
    ...fav.game,
  }));
}

export async function isFavorite(userId: number, gameId: number) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  return !!favorite;
}
