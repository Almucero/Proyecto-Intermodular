import { prisma } from "../../config/db.js";

export async function listGames(filters?: {
  title?: string | undefined;
  price?: number | undefined;
}) {
  try {
    const where: any = {};
    if (filters?.title) {
      where.title = { contains: filters.title, mode: "insensitive" };
    }
    if (filters?.price !== undefined) {
      where.price = filters.price;
    }
    return await prisma.game.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        publisherId: true,
        developerId: true,
        releaseDate: true,
        genres: true,
      },
      orderBy: { id: "asc" } as any,
    });
  } catch (e: any) {
    if (e?.message && e.message.includes("does not exist")) {
      return [];
    }
    throw e;
  }
}

export async function findGameById(id: number) {
  try {
    return await prisma.game.findUnique({
      where: { id } as any,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        publisherId: true,
        developerId: true,
        releaseDate: true,
        genres: true,
        Developer: {
          select: {
            id: true,
            name: true,
          },
        },
        Publisher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (e: any) {
    if (e?.message && e.message.includes("does not exist")) {
      return null;
    }
    throw e;
  }
}

export async function createGame(data: any) {
  return await prisma.game.create({
    data,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      publisherId: true,
      developerId: true,
      releaseDate: true,
      genres: true,
    },
  });
}

export async function updateGame(id: number, data: any) {
  return await prisma.game.update({
    where: { id } as any,
    data,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      publisherId: true,
      developerId: true,
      releaseDate: true,
      genres: true,
    },
  });
}

export async function deleteGame(id: number) {
  return await prisma.game.delete({ where: { id } as any });
}
