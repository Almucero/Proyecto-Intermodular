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

export function githubPopupCallbackCtrl(req: Request, res: Response) {
  const code = typeof req.query['code'] === 'string' ? req.query['code'] : '';
  const state =
    typeof req.query['state'] === 'string' ? req.query['state'] : '';
  const error =
    typeof req.query['error'] === 'string' ? req.query['error'] : '';
  const origin = `${req.protocol}://${req.get('host')}`;

  const payload = JSON.stringify({
    provider: 'github',
    code,
    state,
    error,
    origin,
  });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>GitHub Auth</title></head><body><script>
  (function() {
    var payload = ${payload};
    if (window.opener) {
      window.opener.postMessage(payload, payload.origin);
    }
    window.close();
  })();
  </script></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}
