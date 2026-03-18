import { Model } from './base.model';
import { User } from './user.model';
import { PurchaseItem } from './purchase-item.model';

/**
 * Representa una transacción de compra finalizada.
 */
export interface Purchase extends Model {
  /** ID del usuario que realizó la compra. */
  userId: number;
  /** Precio total pagado por todos los artículos de la compra. */
  totalPrice: number;
  /** Estado actual del pedido (ej. PENDING, COMPLETED, REFUNDED). */
  status: string;
  /** Motivo de la devolución (si se ha solicitado un reembolso). */
  refundReason?: string | null;
  /** Fecha y hora exacta en la que se completó la compra. */
  purchasedAt: string;
  /** Objeto del usuario que realizó la compra. */
  user?: User;
  /** Lista de artículos individuales incluidos en esta compra. */
  items?: PurchaseItem[];
}
