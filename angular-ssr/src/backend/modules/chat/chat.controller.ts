import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  processChat,
  getUserSessions,
  getSession,
  deleteSession,
  updateSessionTitle,
} from './chat.service';
import { chatInputSchema, sessionIdParamSchema } from './chat.schema';

/**
 * Procesa un mensaje de chat del usuario autenticado.
 *
 * @param req Request con payload de chat.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Respuesta del asistente y juegos encontrados.
 */
export const chatCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

/**
 * Lista sesiones de chat del usuario autenticado.
 *
 * @param req Request autenticada.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Listado de sesiones.
 */
export const listSessionsCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const sessions = await getUserSessions(user.sub);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene detalle de una sesión de chat por id.
 *
 * @param req Request con `id` de sesión.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Sesión con mensajes ordenados.
 */
export const getSessionCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { id } = sessionIdParamSchema.parse(req.params);
    const session = await getSession(id, user.sub);
    res.json(session);
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Elimina una sesión de chat del usuario autenticado.
 *
 * @param req Request con `id` de sesión.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Confirmación de borrado.
 */
export const deleteSessionCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { id } = sessionIdParamSchema.parse(req.params);
    const result = await deleteSession(id, user.sub);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Actualiza el título de una sesión de chat del usuario autenticado.
 *
 * @param req Request con `id` de sesión y `title` en el body.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Sesión de chat actualizada.
 */
export const updateSessionCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { id } = sessionIdParamSchema.parse(req.params);
    const { title } = z
      .object({ title: z.string().min(1).max(100) })
      .parse(req.body);
    const result = await updateSessionTitle(id, user.sub, title);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
