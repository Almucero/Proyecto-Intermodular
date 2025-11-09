import { prisma } from "../../config/db.js";

export async function listPublishers() {
  try {
    return await prisma.publisher.findMany({
      select: { id: true, name: true, createdAt: true },
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
      select: { id: true, name: true, createdAt: true },
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
    select: { id: true, name: true, createdAt: true },
  });
}

export async function updatePublisher(id: number, data: { name?: string }) {
  return await prisma.publisher.update({
    where: { id } as any,
    data,
    select: { id: true, name: true, createdAt: true },
  });
}

export async function deletePublisher(id: number) {
  return await prisma.publisher.delete({ where: { id } as any });
}
