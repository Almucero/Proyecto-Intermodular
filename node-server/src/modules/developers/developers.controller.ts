import type { Request, Response } from "express";
import {
  listDevelopers,
  findDeveloperById,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
} from "./developers.service.js";

export async function listDevelopersCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.name) filters.name = req.query.name as string;
    const items = await listDevelopers(filters);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getDeveloperCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const item = await findDeveloperById(id);
    if (!item)
      return res.status(404).json({ message: "Desarrollador no encontrado" });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createDeveloperCtrl(req: Request, res: Response) {
  try {
    const created = await createDeveloper(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Nombre ya en uso" });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function updateDeveloperCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const updated = await updateDeveloper(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Desarrollador no encontrado" });
    res.status(500).json({ message: error.message });
  }
}

export async function deleteDeveloperCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    await deleteDeveloper(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Desarrollador no encontrado" });
    res.status(500).json({ message: error.message });
  }
}
