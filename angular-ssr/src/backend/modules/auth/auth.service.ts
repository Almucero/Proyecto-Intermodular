import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByEmailForLogin,
  recordLoginSuccess,
  recordLoginFailure,
} from '../users/users.service';

export async function register(
  email: string,
  name: string,
  surname: string,
  password: string,
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
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email ya registrado');
  }

  const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await createUser(
    email,
    name,
    surname,
    hash,
    accountAt,
    accountId,
    nickname,
    addressLine1,
    addressLine2,
    city,
    region,
    postalCode,
    country,
  );
  const fullUser = await findUserById((user as any).id);
  const token = jwt.sign(
    {
      sub: (fullUser as any).id,
      email: (fullUser as any).email,
      isAdmin: (fullUser as any).isAdmin ?? false,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  );

  return { user: fullUser, token };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmailForLogin(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const lockUntil = user.lockUntil ? new Date(user.lockUntil) : null;
  if (lockUntil && lockUntil > new Date()) {
    const mins = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
    const err = new Error(`Cuenta bloqueada. Intenta en ${mins} minutos`) as Error & { status?: number };
    err.status = 423;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await recordLoginFailure(user.id);
    throw new Error('Credenciales inválidas');
  }

  await recordLoginSuccess(user.id);
  const fullUser = await findUserById(user.id);

  const token = jwt.sign(
    {
      sub: (fullUser as any).id,
      email: (fullUser as any).email,
      isAdmin: (fullUser as any).isAdmin ?? false,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  );

  return {
    user: fullUser,
    token,
  };
}
