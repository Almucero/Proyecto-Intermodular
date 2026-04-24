import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByEmailForLogin,
  recordLoginSuccess,
  recordLoginFailure,
} from '../users/users.service';

const googleOAuthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function signUserToken(fullUser: any): string {
  return jwt.sign(
    {
      sub: fullUser.id,
      email: fullUser.email,
      isAdmin: fullUser.isAdmin ?? false,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  );
}

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
  const token = signUserToken(fullUser);

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

  const token = signUserToken(fullUser);

  return {
    user: fullUser,
    token,
  };
}

export async function loginWithGoogle(idToken: string) {
  if (!env.GOOGLE_CLIENT_ID) {
    const err = new Error('Inicio de sesión con Google no configurado') as Error & {
      status?: number;
    };
    err.status = 503;
    throw err;
  }

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    throw new Error('No se pudo verificar la cuenta de Google');
  }

  const existingUser = await findUserByEmail(payload.email);
  let fullUser: Awaited<ReturnType<typeof findUserById>> = null;
  if (!existingUser) {
    const fallbackName = payload.given_name || payload.name || payload.email.split('@')[0];
    const fallbackSurname = payload.family_name || payload.name || 'Google';
    const passwordHash = await bcrypt.hash(
      `${randomUUID()}-${Date.now()}`,
      env.BCRYPT_SALT_ROUNDS,
    );
    const created = await createUser(
      payload.email,
      fallbackName,
      fallbackSurname,
      passwordHash,
      null,
      null,
      payload.name || fallbackName,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    fullUser = await findUserById((created as any).id);
  } else {
    fullUser = await findUserById(existingUser.id);
  }

  if (!fullUser) {
    throw new Error('No se pudo recuperar el usuario tras autenticación con Google');
  }

  const token = signUserToken(fullUser);
  return {
    user: fullUser,
    token,
  };
}

export async function loginWithGithub(code: string) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    const err = new Error('Inicio de sesión con GitHub no configurado') as Error & {
      status?: number;
    };
    err.status = 503;
    throw err;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'game-sage-auth',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('No se pudo obtener token de GitHub');
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!tokenPayload.access_token || tokenPayload.error) {
    throw new Error('No se pudo obtener token de GitHub');
  }

  const githubUserResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenPayload.access_token}`,
      'User-Agent': 'game-sage-auth',
    },
  });

  if (!githubUserResponse.ok) {
    throw new Error('No se pudo recuperar usuario de GitHub');
  }

  const githubUser = (await githubUserResponse.json()) as {
    name?: string | null;
    login?: string | null;
    email?: string | null;
  };

  let email = githubUser.email ?? null;
  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenPayload.access_token}`,
        'User-Agent': 'game-sage-auth',
      },
    });
    if (emailsResponse.ok) {
      const emails = (await emailsResponse.json()) as Array<{
        email: string;
        primary?: boolean;
        verified?: boolean;
      }>;
      email =
        emails.find((e) => e.primary && e.verified)?.email ??
        emails.find((e) => e.verified)?.email ??
        emails.find((e) => e.primary)?.email ??
        emails[0]?.email ??
        null;
    }
  }

  if (!email) {
    throw new Error('No se pudo obtener email de GitHub');
  }

  const fullName = (githubUser.name || '').trim();
  const fallbackName = githubUser.login || email.split('@')[0];
  const name = fullName ? fullName.split(' ')[0] : fallbackName;
  const surname = fullName ? fullName.split(' ').slice(1).join(' ') || 'GitHub' : 'GitHub';
  const nickname = githubUser.login || fallbackName;

  const existingUser = await findUserByEmail(email);
  let fullUser: Awaited<ReturnType<typeof findUserById>> = null;
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(
      `${randomUUID()}-${Date.now()}`,
      env.BCRYPT_SALT_ROUNDS,
    );
    const created = await createUser(
      email,
      name,
      surname,
      passwordHash,
      null,
      null,
      nickname,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    fullUser = await findUserById((created as any).id);
  } else {
    fullUser = await findUserById(existingUser.id);
  }

  if (!fullUser) {
    throw new Error('No se pudo recuperar el usuario tras autenticación con GitHub');
  }

  const token = signUserToken(fullUser);
  return { user: fullUser, token };
}
