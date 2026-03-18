import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Purchase } from '../../models/purchase.model';

/**
 * Servicio de mapeo para las compras (Purchase) desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseMappingNodeService implements IBaseMapping<Purchase> {
  constructor() {}

  /** Transforma una lista de compras. */
  getAll(data: any): Purchase[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma una compra única, incluyendo sus artículos relacionados. */
  getOne(data: any): Purchase {
    return {
      id: data.id,
      userId: data.userId,
      totalPrice: data.totalPrice,
      status: data.status,
      refundReason: data.refundReason,
      purchasedAt: data.purchasedAt,
      user: data.user,
      items: data.items,
    };
  }

  getAdded(data: any): Purchase {
    return this.getOne(data);
  }

  getUpdated(data: any): Purchase {
    return this.getOne(data);
  }

  getDeleted(data: any): Purchase {
    return this.getOne(data);
  }

  /** Prepara una compra para ser registrada. */
  setAdd(data: Purchase): any {
    return {
      userId: data.userId,
      totalPrice: data.totalPrice,
      status: data.status,
    };
  }

  /** Prepara actualizaciones de estado o motivos de devolución. */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.refundReason !== undefined)
      payload.refundReason = data.refundReason;
    return payload;
  }
}
