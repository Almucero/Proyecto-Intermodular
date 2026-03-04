import type { Request, Response } from 'express';
import { register, login } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';

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
    else {
      console.error('REGISTER ERROR', e);
    }
    res.status(400).json({ message: e.message });
  }
}

export async function loginCtrl(req: Request, res: Response) {
  // Handler simplificado temporalmente para aislar errores en producción (Vercel).
  // Si esta ruta sigue devolviendo 500 con este código,
  // el problema está antes de llegar al controlador (routing / configuración),
  // no en la lógica de login.
  return res.status(200).json({
    ok: true,
    echo: req.body,
  });
}
