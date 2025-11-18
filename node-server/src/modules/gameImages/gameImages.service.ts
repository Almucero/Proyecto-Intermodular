import { prisma } from "../../config/db.js";

export async function listGameImages(filters?: { gameId?: number }) {
  const where: any = {};
  if (filters?.gameId) where.gameId = filters.gameId;
  return await prisma.gameImage.findMany({
    where,
  });
}

export async function findGameImageById(id: number) {
  return await prisma.gameImage.findUnique({
    where: { id } as any,
    select: {
      id: true,
      url: true,
      altText: true,
      gameId: true,
      Game: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          salePrice: true,
          isOnSale: true,
          isRefundable: true,
          numberOfSales: true,
          rating: true,
          releaseDate: true,
        },
      },
    },
  });
}

export async function createGameImage(data: any) {
  return await prisma.gameImage.create({ data });
}

export async function updateGameImage(id: number, data: any) {
  return await prisma.gameImage.update({ where: { id } as any, data });
}

export async function deleteGameImage(id: number) {
  return await prisma.gameImage.delete({ where: { id } as any });
}
