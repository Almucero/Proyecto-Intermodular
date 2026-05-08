import { prisma } from '../../config/db';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Crea un usuario local con campos de perfil y notificaciones.
 *
 * @param email Email del usuario.
 * @param name Nombre.
 * @param surname Apellidos.
 * @param passwordHash Hash bcrypt de contraseña.
 * @returns Usuario creado con selección pública.
 */
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
  const normalizedNickname =
    (
      nickname ??
      name.split(' ')[0] ??
      email.split('@')[0] ??
      null
    )?.trim() ?? null;

  return prisma.user.create({
    data: {
      email: email.trim(),
      name: name.trim(),
      surname: surname.trim(),
      passwordHash,
      ...(accountAt === undefined ? {} : { accountAt: accountAt ?? null }),
      ...(accountId === undefined ? {} : { accountId: accountId ?? null }),
      nickname: normalizedNickname,
      addressLine1: addressLine1?.trim() ?? null,
      addressLine2: addressLine2?.trim() ?? null,
      city: city?.trim() ?? null,
      region: region?.trim() ?? null,
      postalCode: postalCode?.trim() ?? null,
      country: country?.trim() ?? null,
      balance: 0 as any as Decimal,
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
      emailNotificationsEnabled: true,
      notificationEmail: true,
      emailNotificationLanguage: true,
      emailNotificationFrequency: true,
      emailNotificationTopics: true,
      emailNotificationPausedUntil: true,
      emailQuietHoursStart: true,
      emailQuietHoursEnd: true,
      emailRecommendationIntervalDays: true,
      emailNotificationMeta: true,
      lastSeenAt: true,
    },
  });
}

/** Busca usuario por email exacto. */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/** Busca usuario por handle público `accountAt`. */
export async function findUserByAccountAt(accountAt: string) {
  return prisma.user.findUnique({ where: { accountAt } });
}

/** Busca usuario para flujo de login con campos mínimos de autenticación. */
export async function findUserByEmailForLogin(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      isAdmin: true,
      loginAttempts: true,
      lockUntil: true,
    },
  });
}

/** Número máximo de intentos fallidos antes de bloqueo temporal. */
const MAX_LOGIN_ATTEMPTS = 5;
/** Duración del bloqueo temporal por intentos fallidos. */
const LOCK_TIME_MS = 15 * 60 * 1000;

/** Resetea contadores de bloqueo tras login correcto. */
export async function recordLoginSuccess(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { loginAttempts: 0, lockUntil: null },
  });
}

/** Incrementa intentos fallidos y bloquea temporalmente al superar umbral. */
export async function recordLoginFailure(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true },
  });
  if (!user) return;
  const attempts = (user.loginAttempts ?? 0) + 1;
  const lockUntil = attempts >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCK_TIME_MS) : null;
  await prisma.user.update({
    where: { id: userId },
    data: { loginAttempts: attempts >= MAX_LOGIN_ATTEMPTS ? 0 : attempts, lockUntil },
  });
}

/** Devuelve metadatos de auth para validaciones de token. */
export async function findUserAuthInfo(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: { passwordChangedAt: true },
  });
}

/** Obtiene usuario completo por id con selección serializable para API. */
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
      emailNotificationsEnabled: true,
      notificationEmail: true,
      emailNotificationLanguage: true,
      emailNotificationFrequency: true,
      emailNotificationTopics: true,
      emailNotificationPausedUntil: true,
      emailQuietHoursStart: true,
      emailQuietHoursEnd: true,
      emailRecommendationIntervalDays: true,
      emailNotificationMeta: true,
      lastSeenAt: true,
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

/** Lista usuarios filtrables para paneles administrativos. */
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
    where.email = { contains: filters.email, mode: 'insensitive' };
  }
  if (filters?.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters?.nickname) {
    where.nickname = { contains: filters.nickname, mode: 'insensitive' };
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
      emailNotificationsEnabled: true,
      notificationEmail: true,
      emailNotificationLanguage: true,
      emailNotificationFrequency: true,
      emailNotificationTopics: true,
      emailNotificationPausedUntil: true,
      emailQuietHoursStart: true,
      emailQuietHoursEnd: true,
      emailRecommendationIntervalDays: true,
      emailNotificationMeta: true,
      lastSeenAt: true,
    },
    orderBy: { id: 'asc' },
  });
}

/** Actualiza un usuario por id con payload parcial. */
export async function updateUser(
  id: number,
  data: { name?: string; email?: string },
) {
  return prisma.user.update({ where: { id }, data });
}

/** Elimina usuario por id. */
export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

/** Actualiza perfil del usuario autenticado. */
export async function updateProfile(
  userId: number,
  data: {
    name?: string;
    email?: string;
    nickname?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
    emailNotificationsEnabled?: boolean;
    notificationEmail?: string | null;
    emailNotificationLanguage?: string | null;
    emailNotificationFrequency?: string;
    emailNotificationTopics?: Record<string, boolean>;
    emailNotificationPausedUntil?: Date | null;
    emailQuietHoursStart?: number | null;
    emailQuietHoursEnd?: number | null;
    emailRecommendationIntervalDays?: number;
    emailNotificationMeta?: Record<string, any> | null;
    lastSeenAt?: Date;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data: data as any,
  });
}

/** Marca última actividad del usuario. */
export async function touchUserLastSeen(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date() },
    select: { id: true, lastSeenAt: true },
  });
}

/** Persiste último idioma usado en la app para correos/localización. */
export async function touchUserLastAppLocale(userId: number, locale: string) {
  const l = locale.trim().toLowerCase();
  if (!l) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailNotificationMeta: true },
  });
  if (!user) return;

  const meta = (user.emailNotificationMeta || {}) as Record<string, any>;
  const prev = typeof meta.lastAppLocale === 'string' ? meta.lastAppLocale : '';
  const prevAt = typeof meta.lastAppLocaleAt === 'number' ? meta.lastAppLocaleAt : 0;
  const now = Date.now();

  const tooSoon = now - prevAt < 6 * 60 * 60 * 1000;
  const same = prev.toLowerCase().startsWith(l);
  if (tooSoon && same) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailNotificationMeta: {
        ...(meta as any),
        lastAppLocale: l,
        lastAppLocaleAt: now,
      },
    },
    select: { id: true },
  });
}

/** Cambia contraseña verificando contraseña actual y rotando hash. */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    throw new Error('Contraseña actual incorrecta');
  }

  const newHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash, passwordChangedAt: new Date() },
  });

  return { message: 'Contraseña actualizada correctamente' };
}
