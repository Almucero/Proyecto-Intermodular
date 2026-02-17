import { prisma } from '../../config/db';

export async function listDevelopers(filters?: { name?: string | undefined }) {
  try {
    const where: any = {};
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    return await prisma.developer.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { id: 'asc' } as any,
    });
  } catch (e: any) {
    if (e?.message && e.message.includes('does not exist')) {
      return [];
    }
    throw e;
  }
}

export async function findDeveloperById(id: number) {
  try {
    return await prisma.developer.findUnique({
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
            stockPc: true,
            stockPs5: true,
            stockXboxX: true,
            stockSwitch: true,
            stockPs4: true,
            stockXboxOne: true,
            videoUrl: true,
            rating: true,
            releaseDate: true,
          },
        },
      },
    });
  } catch (e: any) {
    if (e?.message && e.message.includes('does not exist')) {
      return null;
    }
    throw e;
  }
}

export async function createDeveloper(data: { name: string }) {
  return await prisma.developer.create({
    data,
    select: { id: true, name: true },
  });
}

export async function updateDeveloper(id: number, data: { name?: string }) {
  return await prisma.developer.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

export async function deleteDeveloper(id: number) {
  return await prisma.developer.delete({ where: { id } as any });
}
