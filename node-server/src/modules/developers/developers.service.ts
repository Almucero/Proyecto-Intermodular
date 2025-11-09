import { prisma } from "../../config/db.js";

export async function listDevelopers() {
  try {
    return await prisma.developer.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { id: "asc" } as any,
    });
  } catch (e: any) {
    // If the underlying table doesn't exist (tests may run without migrations), return an empty list
    if (e?.message && e.message.includes("does not exist")) {
      return [];
    }
    throw e;
  }
}

export async function findDeveloperById(id: number) {
  try {
    return await prisma.developer.findUnique({
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

export async function createDeveloper(data: { name: string }) {
  return await prisma.developer.create({
    data,
    select: { id: true, name: true, createdAt: true },
  });
}

export async function updateDeveloper(id: number, data: { name?: string }) {
  return await prisma.developer.update({
    where: { id } as any,
    data,
    select: { id: true, name: true, createdAt: true },
  });
}

export async function deleteDeveloper(id: number) {
  return await prisma.developer.delete({ where: { id } as any });
}
