import { prisma } from "../../config/db.js";

export async function addToFavorites(
  userId: number,
  gameId: number,
  platformId: number
) {
  return await prisma.favorite.create({
    data: { userId, gameId, platformId },
    select: {
      id: true,
      userId: true,
      gameId: true,
      platformId: true,
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
      platform: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function removeFromFavorites(
  userId: number,
  gameId: number,
  platformId: number
) {
  await prisma.favorite.delete({
    where: {
      userId_gameId_platformId: { userId, gameId, platformId },
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
      platform: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((fav) => ({
    favoriteId: fav.id,
    favoritedAt: fav.createdAt,
    ...fav.game,
    platform: fav.platform,
  }));
}

export async function isFavorite(
  userId: number,
  gameId: number,
  platformId: number
) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_gameId_platformId: { userId, gameId, platformId } },
  });
  return !!favorite;
}
