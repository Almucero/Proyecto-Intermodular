import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const adminCsv = env.ADMIN_EMAILS ?? "";
  const admins = adminCsv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if ((req.user as any).isAdmin) {
    return next();
  }

  if (admins.includes(req.user.email.toLowerCase())) {
    return next();
  }

  return res
    .status(403)
    .json({ message: "Acceso denegado: solo administradores" });
}
