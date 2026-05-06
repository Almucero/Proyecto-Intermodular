import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { prisma } from '../../config/db';
import {
  createUser,
  findUserByAccountAt,
  findUserByEmail,
  findUserById,
  findUserByEmailForLogin,
  recordLoginSuccess,
  recordLoginFailure,
} from '../users/users.service';

const googleOAuthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const passwordRecoveryStore = new Map<
  string,
  {
    codeHash: string;
    expiresAt: number;
    attempts: number;
    nextAllowedAt: number;
  }
>();
const PASSWORD_RECOVERY_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RECOVERY_RESEND_INTERVAL_MS = 60 * 1000;
const MAX_PASSWORD_RECOVERY_ATTEMPTS = 5;

const passwordRecoveryEmailContent: Record<
  string,
  { subject: string; title: string; message: string; expiration: string }
> = {
  es: {
    subject: 'Recuperación de contraseña - Game Sage',
    title: 'Código de recuperación',
    message: 'Usa este código para recuperar tu contraseña:',
    expiration: 'El código caduca en 15 minutos.',
  },
  en: {
    subject: 'Password recovery - Game Sage',
    title: 'Recovery code',
    message: 'Use this code to recover your password:',
    expiration: 'The code expires in 15 minutes.',
  },
  fr: {
    subject: 'Récupération du mot de passe - Game Sage',
    title: 'Code de récupération',
    message: 'Utilisez ce code pour récupérer votre mot de passe :',
    expiration: 'Le code expire dans 15 minutes.',
  },
  de: {
    subject: 'Passwort-Wiederherstellung - Game Sage',
    title: 'Wiederherstellungscode',
    message: 'Verwende diesen Code, um dein Passwort wiederherzustellen:',
    expiration: 'Der Code läuft in 15 Minuten ab.',
  },
  it: {
    subject: 'Recupero password - Game Sage',
    title: 'Codice di recupero',
    message: 'Usa questo codice per recuperare la tua password:',
    expiration: 'Il codice scade tra 15 minuti.',
  },
};

function splitDisplayName(fullName?: string | null): { name: string; surname: string } {
  const normalized = (fullName ?? '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { name: 'Usuario', surname: 'Social' };
  }
  const parts = normalized.split(' ');
  if (parts.length === 1) {
    return { name: parts[0], surname: 'Social' };
  }
  return {
    name: parts[0],
    surname: parts.slice(1).join(' '),
  };
}

function normalizeHandleCandidate(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '')
    .replace(/^[._-]+|[._-]+$/g, '');
}

async function buildUniqueAccountAt(
  candidates: Array<string | null | undefined>,
  email: string,
): Promise<string> {
  const fallback = email.split('@')[0] || `user${Date.now()}`;
  const baseCandidate =
    candidates
      .map((c) => normalizeHandleCandidate(c))
      .find((c) => c.length > 0) ??
    normalizeHandleCandidate(fallback) ??
    `user${Date.now()}`;

  let attempt = 0;
  while (attempt < 200) {
    const suffix = attempt === 0 ? '' : `${attempt + 1}`;
    const proposed = `@${baseCandidate}${suffix}`;
    const exists = await findUserByAccountAt(proposed);
    if (!exists) return proposed;
    attempt += 1;
  }
  return `@${baseCandidate}${Date.now()}`;
}

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
    const parsed = splitDisplayName(payload.name);
    const fallbackName =
      (payload.given_name || parsed.name || payload.email.split('@')[0]).trim();
    const fallbackSurname =
      (payload.family_name || parsed.surname || 'Google').trim();
    const nickname = (payload.name || `${fallbackName} ${fallbackSurname}`).trim();
    const accountAt = await buildUniqueAccountAt(
      [payload.given_name, payload.name, payload.email.split('@')[0]],
      payload.email,
    );
    const passwordHash = await bcrypt.hash(
      `${randomUUID()}-${Date.now()}`,
      env.BCRYPT_SALT_ROUNDS,
    );
    const created = await createUser(
      payload.email,
      fallbackName,
      fallbackSurname,
      passwordHash,
      accountAt,
      undefined,
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
  const parsed = splitDisplayName(fullName);
  const fallbackName = githubUser.login || email.split('@')[0];
  const name = fullName ? parsed.name : fallbackName;
  const surname = fullName ? parsed.surname || 'GitHub' : 'GitHub';
  const nickname = githubUser.login || fallbackName;
  const accountAt = await buildUniqueAccountAt(
    [githubUser.login, fullName, email.split('@')[0]],
    email,
  );

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
      accountAt,
      undefined,
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

function buildRecoveryCode(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

async function sendPasswordRecoveryEmail(
  to: string,
  locale: string,
  code: string,
): Promise<void> {
  const language = passwordRecoveryEmailContent[locale] ? locale : 'es';
  const content = passwordRecoveryEmailContent[language];
  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] || '587');
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const from = process.env['SMTP_FROM'] || 'no-reply@gamesage.local';
  if (!host || !user || !pass) {
    throw new Error('SMTP no configurado');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: content.subject,
    text: `${content.message} ${code}. ${content.expiration}`,
    html: `<div style="font-family:Arial,sans-serif"><h2>${content.title}</h2><p>${content.message}</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>${content.expiration}</p></div>`,
  });
}

export async function requestPasswordRecovery(email: string, locale: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return { ok: true };
  }

  const existingEntry = passwordRecoveryStore.get(normalizedEmail);
  if (existingEntry && Date.now() < existingEntry.nextAllowedAt) {
    const error = new Error('Demasiadas solicitudes') as Error & {
      status?: number;
      retryAfterMs?: number;
    };
    error.status = 429;
    error.retryAfterMs = existingEntry.nextAllowedAt - Date.now();
    throw error;
  }

  const code = buildRecoveryCode();
  const codeHash = await bcrypt.hash(code, env.BCRYPT_SALT_ROUNDS);
  const expiresAt = Date.now() + PASSWORD_RECOVERY_TTL_MS;
  const nextAllowedAt =
    Date.now() + PASSWORD_RECOVERY_RESEND_INTERVAL_MS;
  passwordRecoveryStore.set(normalizedEmail, {
    codeHash,
    expiresAt,
    attempts: 0,
    nextAllowedAt,
  });

  await sendPasswordRecoveryEmail(normalizedEmail, locale, code);
  return { ok: true, expiresAt };
}

export async function verifyPasswordRecoveryCode(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = passwordRecoveryStore.get(normalizedEmail);
  if (!entry || Date.now() > entry.expiresAt) {
    passwordRecoveryStore.delete(normalizedEmail);
    const error = new Error('Código inválido o expirado') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }
  const isValid = await bcrypt.compare(code, entry.codeHash);
  if (!isValid) {
    entry.attempts += 1;
    if (entry.attempts >= MAX_PASSWORD_RECOVERY_ATTEMPTS) {
      passwordRecoveryStore.delete(normalizedEmail);
    } else {
      passwordRecoveryStore.set(normalizedEmail, entry);
    }
    const error = new Error('Código inválido o expirado') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }
  return { ok: true };
}

export async function resetPasswordWithRecoveryCode(
  email: string,
  code: string,
  newPassword: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  await verifyPasswordRecoveryCode(normalizedEmail, code);
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    passwordRecoveryStore.delete(normalizedEmail);
    return { ok: true };
  }

  const newHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      passwordChangedAt: new Date(),
      loginAttempts: 0,
      lockUntil: null,
    },
  });
  passwordRecoveryStore.delete(normalizedEmail);
  return { ok: true };
}
