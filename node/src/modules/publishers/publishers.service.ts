import { prisma } from "../../config/db.js";

export async function listPublishers(filters?: { name?: string | undefined }) {
  try {
    const where: any = {};
    if (filters?.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }
    return await prisma.publisher.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { id: "asc" } as any,
    });
  } catch (e: any) {
    if (e?.message && e.message.includes("does not exist")) {
      return [];
    }
    throw e;
  }
}

export async function findPublisherById(id: number) {
  try {
    return await prisma.publisher.findUnique({
      where: { id } as any,
      select: {
        id: true,
        name: true,
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
            stock: true,
            videoUrl: true,
            rating: true,
            releaseDate: true,
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

export async function createPublisher(data: { name: string }) {
  return await prisma.publisher.create({
    data,
    select: { id: true, name: true },
  });
}

export async function updatePublisher(id: number, data: { name?: string }) {
  return await prisma.publisher.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

export async function deletePublisher(id: number) {
  return await prisma.publisher.delete({ where: { id } as any });
}
