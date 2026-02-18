import type { Request, Response } from 'express';
import {
  listGenres,
  findGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from './genres.service';

export async function listGenresCtrl(_req: Request, res: Response) {
  try {
    const filters: any = {};
    if (_req.query.name) filters.name = String(_req.query.name);
    const items = await listGenres(filters);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getGenreCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await findGenreById(id);
    if (!item) return res.status(404).json({ message: 'Genre no encontrado' });
    const response: any = { ...item };
    if (item.games) {
      response.games = item.games;
    }
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function createGenreCtrl(req: Request, res: Response) {
  try {
    const payload = { name: req.body.name };
    const created = await createGenre(payload);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.code === 'P2002')
      return res.status(409).json({ message: 'Genre duplicado' });
    res.status(500).json({ message: err.message });
  }
}

export async function updateGenreCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const payload: any = {};
    if (req.body.name) payload.name = req.body.name;
    const updated = await updateGenre(id, payload);
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025')
      return res.status(404).json({ message: 'Genre no encontrado' });
    res.status(500).json({ message: err.message });
  }
}

export async function deleteGenreCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await deleteGenre(id);
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025')
      return res.status(404).json({ message: 'Genre no encontrado' });
    res.status(500).json({ message: err.message });
  }
}
