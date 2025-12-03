import { prisma } from "../../config/db.js";
import bcrypt from "bcrypt";
import { env } from "../../config/env.js";
import { Prisma } from "@prisma/client";

export async function createUser(
  email: string,
  name: string,
  surname: string,
  passwordHash: string,
  accountAt?: string | null,
  accountId?: string | null,
  nickname?: string | null,
  addressLine1?: string | null,
  addressLine2?: string | null,
  city?: string | null,
  region?: string | null,
  postalCode?: string | null,
  country?: string | null,
) {
  return prisma.user.create({
    data: {
      email,
      name,
      surname,
      passwordHash,
      accountAt: accountAt ?? new Date().toISOString(),
      accountId: accountId ?? null,
      nickname: nickname ?? name.split(" ")[0] ?? email.split("@")[0] ?? null,
      addressLine1: addressLine1 ?? null,
      addressLine2: addressLine2 ?? null,
      city: city ?? null,
      region: region ?? null,
      postalCode: postalCode ?? null,
      country: country ?? null,
      balance: new Prisma.Decimal(0),
    },
    select: {
      id: true,
      accountId: true,
      accountAt: true,
      nickname: true,
      email: true,
      name: true,
      surname: true,
      balance: true,
      points: true,
      isAdmin: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      accountId: true,
      accountAt: true,
      nickname: true,
      email: true,
      name: true,
      surname: true,
      balance: true,
      points: true,
      isAdmin: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
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
      },
    },
  });
}

export async function listUsers(filters?: {
  email?: string | undefined;
  name?: string | undefined;
  nickname?: string | undefined;
  isAdmin?: boolean | undefined;
  minPoints?: number | undefined;
  maxPoints?: number | undefined;
  minBalance?: number | undefined;
  maxBalance?: number | undefined;
}) {
  const where: any = {};
  if (filters?.email) {
    where.email = { contains: filters.email, mode: "insensitive" };
  }
  if (filters?.name) {
    where.name = { contains: filters.name, mode: "insensitive" };
  }
  if (filters?.nickname) {
    where.nickname = { contains: filters.nickname, mode: "insensitive" };
  }
  if (filters?.isAdmin !== undefined) {
    where.isAdmin = filters.isAdmin;
  }
  if (filters?.minPoints !== undefined || filters?.maxPoints !== undefined) {
    where.points = {};
    if (filters?.minPoints !== undefined) where.points.gte = filters.minPoints;
    if (filters?.maxPoints !== undefined) where.points.lte = filters.maxPoints;
  }
  if (filters?.minBalance !== undefined || filters?.maxBalance !== undefined) {
    where.balance = {};
    if (filters?.minBalance !== undefined)
      where.balance.gte = filters.minBalance;
    if (filters?.maxBalance !== undefined)
      where.balance.lte = filters.maxBalance;
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      accountId: true,
      accountAt: true,
      email: true,
      name: true,
      surname: true,
      nickname: true,
      isAdmin: true,
      points: true,
      balance: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
    },
    orderBy: { id: "asc" },
  });
}

export async function updateUser(
  id: number,
  data: { name?: string; email?: string },
) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

export async function updateProfile(
  userId: number,
  data: { name?: string; email?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    throw new Error("Contraseña actual incorrecta");
  }

  const newHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { message: "Contraseña actualizada correctamente" };
}
