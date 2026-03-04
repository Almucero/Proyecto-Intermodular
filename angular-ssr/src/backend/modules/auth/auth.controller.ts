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
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await login(email, password);
    res.json(data);
  } catch (e: any) {
    if (e.status === 423) {
      return res.status(423).json({ message: e.message });
    }
    else if (e.message === 'Credenciales inválidas') {
      return res.status(401).json({ message: e.message });
    }
    else {
      console.error('LOGIN ERROR', e);
    }
    res.status(400).json({ message: e.message });
  }
}
