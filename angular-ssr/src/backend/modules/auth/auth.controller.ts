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
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Google Auth</title></head><body><script>
  (function() {
    var target = '/login';
    try {
      var storedTarget = window.sessionStorage.getItem('google_oauth_target');
      if (storedTarget && storedTarget.charAt(0) === '/') target = storedTarget;
      window.sessionStorage.removeItem('google_oauth_target');
    } catch (e) {}
    var destination = new URL(target, ${JSON.stringify(origin)});
    if (window.location.search && window.location.search.length > 1) {
      var params = new URLSearchParams(window.location.search.slice(1));
      params.forEach(function(value, key) {
        destination.searchParams.set(key, value);
      });
    }
    if (window.location.hash && window.location.hash.length > 1) {
      destination.hash = window.location.hash.slice(1);
    }
    destination.searchParams.set('_skip_loader', '1');
    try {
      window.sessionStorage.setItem('skip_loading_screen_once', '1');
    } catch (e) {}
    window.location.replace(destination.toString());
  })();
  </script></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
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
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>GitHub Auth</title></head><body><script>
  (function() {
    try {
      window.sessionStorage.setItem('skip_loading_screen_once', '1');
    } catch (e) {}
    window.location.replace(${JSON.stringify(redirectUrl.toString())});
  })();
  </script></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}
