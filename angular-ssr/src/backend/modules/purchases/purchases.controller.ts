import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  completePurchase,
  getUserPurchases,
  getPurchase,
  refundPurchase,
} from './purchases.service';
import { notifyPurchaseStatus } from '../notifications';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';

/** Valida payload de checkout manual con ids de carrito. */
const checkoutSchema = z.object({
  cartItemIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Al menos un juego es requerido'),
});

/** Valida payload de reembolso en POST. */
const refundSchema = z.object({
  reason: z
    .string()
    .min(5, 'La razón debe tener al menos 5 caracteres')
    .max(500),
});
/** Valida payload de compatibilidad en PATCH para reembolso. */
const refundPatchSchema = z.object({
  reason: z.string().min(5).max(500).optional(),
  refundReason: z.string().min(5).max(500).optional(),
});

/** Valida `id` de compra en params. */
const purchaseIdSchema = z.object({
  id: z.coerce.number().int().positive('ID inválido'),
});

/** Valida filtro de estado en querystring. */
const statusQuerySchema = z.object({
  status: z.enum(['completed', 'refunded']).optional(),
});

/**
 * Procesa checkout manual de los items indicados y notifica compra.
 *
 * @param req Request autenticada con ids de carrito.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Compra creada.
 */
export async function checkoutCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const bodyParsed = checkoutSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { cartItemIds } = bodyParsed.data;

    const purchase = await completePurchase(user.sub, cartItemIds);
    void notifyPurchaseStatus({
      userId: user.sub,
      type: 'purchase',
      games: (purchase.items || []).map((it: any) => ({
        title: it.title,
        platform: it.platform?.name || 'Platform',
        price: Number(it.purchasePrice ?? it.price ?? 0),
      })),
      total: Number(purchase.totalPrice ?? 0),
      reference: `PUR-${purchase.id}`,
    });

    logger.info(
      `User ${user.sub} completed purchase with items: ${cartItemIds.join(
        ', ',
      )}`,
    );
    res.status(201).json(purchase);
  } catch (error: any) {
    if (
      error.message === 'Algunos artículos del carrito no fueron encontrados'
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (env.NODE_ENV !== 'production') {
      logger.error('Error in checkoutCtrl:', error);
    } else {
      logger.error('Error in checkoutCtrl');
    }
    return res.status(400).json({ message: error.message });
  }
}

/**
 * Lista compras del usuario autenticado con filtro opcional por estado.
 *
 * @param req Request autenticada.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Listado de compras.
 */
export async function getUserPurchasesCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const queryParsed = statusQuerySchema.safeParse(req.query);

    if (!queryParsed.success) {
      return res.status(400).json({
        message: 'Parámetros de consulta inválidos',
        errors: queryParsed.error.issues,
      });
    }

    const purchases = await getUserPurchases(user.sub, queryParsed.data.status);
    res.json(purchases);
  } catch (error: any) {
    if (env.NODE_ENV !== 'production') {
      logger.error('Error in getUserPurchasesCtrl:', error);
    } else {
      logger.error('Error in getUserPurchasesCtrl');
    }
    res.status(500).json({ message: 'Error al obtener compras' });
  }
}

/**
 * Recupera detalle de una compra del usuario autenticado.
 *
 * @param req Request con id de compra en params.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Compra solicitada.
 */
export async function getPurchaseCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const paramsParsed = purchaseIdSchema.safeParse({ id: req.params.id });

    if (!paramsParsed.success) {
      return res.status(400).json({
        message: 'ID inválido',
        errors: paramsParsed.error.issues,
      });
    }

    const purchase = await getPurchase(user.sub, paramsParsed.data.id);
    res.json(purchase);
  } catch (error: any) {
    if (error.message === 'Compra no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    if (env.NODE_ENV !== 'production') {
      logger.error('Error in getPurchaseCtrl:', error);
    } else {
      logger.error('Error in getPurchaseCtrl');
    }
    res.status(500).json({ message: 'Error al obtener la compra' });
  }
}

/**
 * Reembolsa una compra existente y notifica el estado por email.
 *
 * @param req Request con id de compra y razón.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Compra actualizada a estado `refunded`.
 */
export async function refundPurchaseCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const paramsParsed = purchaseIdSchema.safeParse({ id: req.params.id });
    const bodyParsed = refundSchema.safeParse(req.body);

    if (!paramsParsed.success) {
      return res.status(400).json({
        message: 'ID inválido',
        errors: paramsParsed.error.issues,
      });
    }

    if (!bodyParsed.success) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: bodyParsed.error.issues,
      });
    }

    const purchase = await refundPurchase(
      user.sub,
      paramsParsed.data.id,
      bodyParsed.data.reason,
    );
    void notifyPurchaseStatus({
      userId: user.sub,
      type: 'refund',
      games: (purchase.items || []).map((it: any) => ({
        title: it.title,
        platform: it.platform?.name || 'Platform',
        price: Number(it.purchasePrice ?? it.price ?? 0),
      })),
      total: Number(purchase.totalPrice ?? 0),
      reference: `REF-${purchase.id}`,
    });
    res.json(purchase);
  } catch (error: any) {
    if (error.message === 'Compra no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Esta compra ya ha sido reembolsada') {
      return res.status(400).json({ message: error.message });
    }
    if (env.NODE_ENV !== 'production') {
      logger.error('Error in refundPurchaseCtrl:', error);
    } else {
      logger.error('Error in refundPurchaseCtrl');
    }
    res.status(500).json({ message: 'Error al procesar el reembolso' });
  }
}

/**
 * Endpoint PATCH de compatibilidad para reembolsos legacy.
 *
 * @param req Request con id de compra y `reason/refundReason`.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Compra actualizada a estado `refunded`.
 */
export async function refundPurchasePatchCompatCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const paramsParsed = purchaseIdSchema.safeParse({ id: req.params.id });
    const bodyParsed = refundPatchSchema.safeParse(req.body);

    if (!paramsParsed.success) {
      return res.status(400).json({
        message: 'ID inválido',
        errors: paramsParsed.error.issues,
      });
    }

    if (!bodyParsed.success) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: bodyParsed.error.issues,
      });
    }

    const reason = bodyParsed.data.reason ?? bodyParsed.data.refundReason;
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: [{ path: ['reason'], message: 'La razón es requerida' }],
      });
    }

    const purchase = await refundPurchase(user.sub, paramsParsed.data.id, reason);
    void notifyPurchaseStatus({
      userId: user.sub,
      type: 'refund',
      games: (purchase.items || []).map((it: any) => ({
        title: it.title,
        platform: it.platform?.name || 'Platform',
        price: Number(it.purchasePrice ?? it.price ?? 0),
      })),
      total: Number(purchase.totalPrice ?? 0),
      reference: `REF-${purchase.id}`,
    });
    res.json(purchase);
  } catch (error: any) {
    if (error.message === 'Compra no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Esta compra ya ha sido reembolsada') {
      return res.status(400).json({ message: error.message });
    }
    if (env.NODE_ENV !== 'production') {
      logger.error('Error in refundPurchasePatchCompatCtrl:', error);
    } else {
      logger.error('Error in refundPurchasePatchCompatCtrl');
    }
    res.status(500).json({ message: 'Error al procesar el reembolso' });
  }
}
