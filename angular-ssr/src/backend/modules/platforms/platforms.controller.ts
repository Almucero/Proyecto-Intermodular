/**
 * @file: src/backend/modules/platforms/platforms.controller.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Controladores que manejan la lógica de negocio para operaciones CRUD de plataformas, incluyendo listado, creación, actualización y eliminación.
 */

import type { Request, Response } from 'express';
import {
  listPlatforms,
  findPlatformById,
  createPlatform,
  updatePlatform,
  deletePlatform,
} from './platforms.service';

/**
 * Lista plataformas con filtro opcional por nombre.
 *
 * @param _req Request HTTP.
 * @param res Response HTTP.
 * @returns Listado de plataformas.
 */
export async function listPlatformsCtrl(_req: Request, res: Response) {
  try {
    const filters: any = {};
    if (_req.query.name) filters.name = String(_req.query.name);
    const items = await listPlatforms(filters);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Obtiene una plataforma por id.
 *
 * @param req Request con `id`.
 * @param res Response HTTP.
 * @returns Plataforma solicitada.
 */
export async function getPlatformCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await findPlatformById(id);
    if (!item)
      return res.status(404).json({ message: 'Platform no encontrado' });
    const response: any = { ...item };
    if (item.games) {
      response.games = item.games;
    }
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Crea una plataforma.
 *
 * @param req Request con payload de creación.
 * @param res Response HTTP.
 * @returns Plataforma creada.
 */
export async function createPlatformCtrl(req: Request, res: Response) {
  try {
    const payload = { name: req.body.name };
    const created = await createPlatform(payload);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.code === 'P2002')
      return res.status(409).json({ message: 'Platform duplicado' });
    res.status(500).json({ message: err.message });
  }
}

/**
 * Actualiza una plataforma existente.
 *
 * @param req Request con `id` y payload parcial.
 * @param res Response HTTP.
 * @returns Plataforma actualizada.
 */
export async function updatePlatformCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const payload: any = {};
    if (req.body.name) payload.name = req.body.name;
    const updated = await updatePlatform(id, payload);
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025')
      return res.status(404).json({ message: 'Platform no encontrado' });
    res.status(500).json({ message: err.message });
  }
}

/**
 * Elimina una plataforma por id.
 *
 * @param req Request con `id`.
 * @param res Response HTTP.
 * @returns `204 No Content` al eliminar.
 */
export async function deletePlatformCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await deletePlatform(id);
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025')
      return res.status(404).json({ message: 'Platform no encontrado' });
    res.status(500).json({ message: err.message });
  }
}
