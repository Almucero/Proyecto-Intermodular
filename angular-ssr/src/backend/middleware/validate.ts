import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { applySecurityHeaders, applyNoCacheHeaders } from '../../security-headers';

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    applySecurityHeaders(req, res);
    applyNoCacheHeaders(res);
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
  };
