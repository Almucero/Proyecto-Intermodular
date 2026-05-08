import type { Request, Response } from 'express';
import {
  listUsers,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
} from './users.service';

/**
 * Lista usuarios con filtros opcionales desde query params.
 *
 * @param req Request HTTP.
 * @param res Response HTTP.
 * @returns Lista de usuarios sin `passwordHash`.
 */
export async function listUsersCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.email) filters.email = req.query.email as string;
    if (req.query.name) filters.name = req.query.name as string;
    if (req.query.nickname) filters.nickname = req.query.nickname as string;
    if (req.query.isAdmin !== undefined)
      filters.isAdmin = req.query.isAdmin === 'true';
    if (req.query.minPoints !== undefined)
      filters.minPoints = Number(req.query.minPoints);
    if (req.query.maxPoints !== undefined)
      filters.maxPoints = Number(req.query.maxPoints);
    if (req.query.minBalance !== undefined)
      filters.minBalance = Number(req.query.minBalance);
    if (req.query.maxBalance !== undefined)
      filters.maxBalance = Number(req.query.maxBalance);
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

/**
 * Obtiene un usuario por id con control de acceso propietario/admin.
 *
 * @param req Request con `id` en params.
 * @param res Response HTTP.
 * @returns Usuario solicitado sin `passwordHash`.
 */
export async function getUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    if (req.user && req.user.sub !== id && !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Obtiene el perfil del usuario autenticado.
 *
 * @param req Request autenticada.
 * @param res Response HTTP.
 * @returns Usuario autenticado sin `passwordHash`.
 */
export async function meCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const userId = Number(req.user.sub);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ message: 'ID de usuario inválido en token' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Actualiza un usuario por id con control de acceso propietario/admin.
 *
 * @param req Request con `id` y payload parcial.
 * @param res Response HTTP.
 * @returns Usuario actualizado sin `passwordHash`.
 */
export async function updateUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    if (req.user && req.user.sub !== id && !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const user = await updateUser(id, req.body);
    const { passwordHash, ...safe } = (user as any) || {};
    res.json(safe);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El email ya está en uso' });
    }
    res.status(500).json({ message: error.message });
  }
}

/**
 * Elimina un usuario por id.
 *
 * @param req Request con `id` en params.
 * @param res Response HTTP.
 * @returns `204 No Content` si se elimina correctamente.
 */
export async function deleteUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await deleteUser(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(500).json({ message: error.message });
  }
}

/**
 * Actualiza el perfil del usuario autenticado.
 *
 * @param req Request autenticada con payload parcial.
 * @param res Response HTTP.
 * @returns Perfil actualizado sin `passwordHash`.
 */
export async function updateProfileCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const userId = Number(req.user.sub);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ message: 'ID de usuario inválido en token' });
    }

    await updateProfile(userId, req.body);
    const full = await findUserById(userId);
    const { passwordHash, ...safe } = (full as any) || {};
    res.json(safe);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El email ya está en uso' });
    }
    res.status(500).json({ message: error.message });
  }
}

/**
 * Cambia la contraseña del usuario autenticado.
 *
 * @param req Request autenticada con `currentPassword` y `newPassword`.
 * @param res Response HTTP.
 * @returns Confirmación de cambio de contraseña.
 */
export async function changePasswordCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(
      req.user.sub,
      currentPassword,
      newPassword,
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Contraseña actual incorrecta') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
}
