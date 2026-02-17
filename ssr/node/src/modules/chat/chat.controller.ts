import type { Request, Response, NextFunction } from "express";
import {
  processChat,
  getUserSessions,
  getSession,
  deleteSession,
} from "./chat.service.js";
import { chatInputSchema, sessionIdParamSchema } from "./chat.schema.js";

export const chatCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const input = chatInputSchema.parse(req.body);
    const result = await processChat(user.sub, input.message, input.sessionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const listSessionsCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const sessions = await getUserSessions(user.sub);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getSessionCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const { id } = sessionIdParamSchema.parse(req.params);
    const session = await getSession(id, user.sub);
    res.json(session);
  } catch (error: any) {
    if (error.message === "Sesión no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteSessionCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const { id } = sessionIdParamSchema.parse(req.params);
    const result = await deleteSession(id, user.sub);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Sesión no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
