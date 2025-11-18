import { prisma } from "../../config/db.js";

export async function listGenres(filters?: { name?: string }) {
  const where: any = {};
  if (filters?.name)
    where.name = { contains: filters.name, mode: "insensitive" };
  return await prisma.genre.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { id: "asc" } as any,
  });
}

export async function findGenreById(id: number) {
  return await prisma.genre.findUnique({
    where: { id } as any,
    select: {
      id: true,
      name: true,
      games: {
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

export async function createGenre(data: { name: string }) {
  return await prisma.genre.create({ data, select: { id: true, name: true } });
}

export async function updateGenre(id: number, data: { name?: string }) {
  return await prisma.genre.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

export async function deleteGenre(id: number) {
  return await prisma.genre.delete({ where: { id } as any });
}
