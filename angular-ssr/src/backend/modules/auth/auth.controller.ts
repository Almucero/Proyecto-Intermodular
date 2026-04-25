import type { Request, Response } from 'express';
import {
  register,
  login,
  loginWithGoogle,
  loginWithGithub,
} from './auth.service';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  githubLoginSchema,
} from './auth.schema';
import { env } from '../../config/env';

function getRequestOrigin(req: Request): string {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get('host') || 'localhost';
  return `${protocol}://${host}`;
}

function getCookieValue(req: Request, key: string): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  const entries = cookies.split(';');
  for (const entry of entries) {
    const [rawKey, ...rest] = entry.trim().split('=');
    if (rawKey === key) {
      const rawValue = rest.join('=');
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }
  return null;
}

export async function registerCtrl(req: Request, res: Response) {
  try {
    const {
      email,
      name,
      surname,
      password,
      accountAt,
      accountId,
      nickname,
      addressLine1,
      addressLine2,
      city,
      region,
      postalCode,
      country,
    } = registerSchema.parse(req.body);
    const data = await register(
      email,
      name,
      surname,
      password,
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
    res.status(201).json(data);
  } catch (e: any) {
    if (e.message === 'Email ya registrado') {
      return res.status(409).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}

export async function loginCtrl(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await login(email, password);
    res.json(data);
  } catch (e: any) {
    if (e.status === 423) {
      return res.status(423).json({ message: e.message });
    }
    if (e.message === 'Credenciales inválidas') {
      return res.status(401).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}

export async function googleLoginCtrl(req: Request, res: Response) {
  try {
    const { idToken } = googleLoginSchema.parse(req.body);
    const data = await loginWithGoogle(idToken);
    res.json(data);
  } catch (e: any) {
    if (e.status === 503) {
      return res.status(503).json({ message: e.message });
    }
    if (e.message === 'No se pudo verificar la cuenta de Google') {
      return res.status(401).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}

export function googleClientIdCtrl(_req: Request, res: Response) {
  if (!env.GOOGLE_CLIENT_ID) {
    return res.status(200).json({ enabled: false, clientId: null });
  }
  return res
    .status(200)
    .json({ enabled: true, clientId: env.GOOGLE_CLIENT_ID });
}

export function googleCallbackCtrl(_req: Request, res: Response) {
  const origin = getRequestOrigin(_req);
  const cookieTarget = getCookieValue(_req, 'google_oauth_target');
  const safeTarget =
    cookieTarget && cookieTarget.startsWith('/') ? cookieTarget : '/login';
  const destination = new URL(safeTarget, origin);

  if (_req.query) {
    for (const [key, value] of Object.entries(_req.query)) {
      if (key === '__path') {
        continue;
      }
      if (typeof value === 'string') {
        destination.searchParams.set(key, value);
      }
    }
  }

  destination.searchParams.set('_skip_loader', '1');
  res.setHeader(
    'Set-Cookie',
    'google_oauth_target=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
  );
  res.redirect(302, destination.toString());
}

export async function githubLoginCtrl(req: Request, res: Response) {
  try {
    const { code } = githubLoginSchema.parse(req.body);
    const data = await loginWithGithub(code);
    res.json(data);
  } catch (e: any) {
    if (e.status === 503) {
      return res.status(503).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}

export function githubClientIdCtrl(_req: Request, res: Response) {
  if (!env.GITHUB_CLIENT_ID) {
    return res.status(200).json({ enabled: false, clientId: null });
  }
  return res
    .status(200)
    .json({ enabled: true, clientId: env.GITHUB_CLIENT_ID });
}

export function githubCallbackCtrl(req: Request, res: Response) {
  const code = typeof req.query['code'] === 'string' ? req.query['code'] : '';
  const state =
    typeof req.query['state'] === 'string' ? req.query['state'] : '';
  const error =
    typeof req.query['error'] === 'string' ? req.query['error'] : '';
  const target = typeof req.query['target'] === 'string' ? req.query['target'] : '/login';
  const origin = getRequestOrigin(req);
  const safeTarget = target.startsWith('/') ? target : '/login';
  const redirectUrl = new URL(safeTarget, origin);
  redirectUrl.searchParams.set('_skip_loader', '1');
  if (code) redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);
  if (error) redirectUrl.searchParams.set('error', error);
  res.redirect(302, redirectUrl.toString());
}
