import type { Request, Response, NextFunction } from 'express';
import { serializePrisma } from '../utils/serialize';

export function responseSerializer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json.bind(res);

  res.json = ((data: any) => {
    try {
      const safe = serializePrisma(data);
      return originalJson(safe);
    } catch (err) {
      return originalJson(data);
    }
  }) as typeof res.json;

  next();
}
