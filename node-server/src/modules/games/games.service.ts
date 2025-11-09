import { prisma } from "../../config/db.js";

export async function listGames() {
  try {
    return await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        publisherId: true,
        developerId: true,
        releaseDate: true,
        genres: true,
        createdAt: true,
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
        createdAt: true,
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
      createdAt: true,
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
      createdAt: true,
    },
  });
}

export async function deleteGame(id: number) {
  return await prisma.game.delete({ where: { id } as any });
}
