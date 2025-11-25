import { prisma } from "../../config/db.js";

export async function listPlatforms(filters?: { name?: string }) {
  const where: any = {};
  if (filters?.name)
    where.name = { contains: filters.name, mode: "insensitive" };
  return await prisma.platform.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { id: "asc" } as any,
  });
}

export async function findPlatformById(id: number) {
  return await prisma.platform.findUnique({
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
          stock: true,
          videoUrl: true,
          rating: true,
          releaseDate: true,
        },
      },
    },
  });
}

export async function createPlatform(data: { name: string }) {
  return await prisma.platform.create({
    data,
    select: { id: true, name: true },
  });
}

export async function updatePlatform(id: number, data: { name?: string }) {
  return await prisma.platform.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

export async function deletePlatform(id: number) {
  return await prisma.platform.delete({ where: { id } as any });
}
