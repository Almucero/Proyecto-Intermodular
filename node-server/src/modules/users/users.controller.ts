import type { Request, Response } from "express";
import {
  listUsers,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
} from "./users.service.js";

export async function listUsersCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.email) filters.email = req.query.email as string;
    if (req.query.name) filters.name = req.query.name as string;
    if (req.query.isAdmin !== undefined)
      filters.isAdmin = req.query.isAdmin === "true";
    const users = await listUsers(filters);
    const safe = (users as any[]).map((u) => {
      const { passwordHash, ...rest } = u as any;
      return rest;
    });
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function meCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const user = await updateUser(id, req.body);
    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El email ya está en uso" });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function deleteUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await deleteUser(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfileCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const user = await updateProfile(req.user.sub, req.body);
    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El email ya está en uso" });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function changePasswordCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(
      req.user.sub,
      currentPassword,
      newPassword
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === "Contraseña actual incorrecta") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
}
