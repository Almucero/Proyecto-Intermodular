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
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de compras.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): Purchase[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma una compra única, incluyendo sus artículos relacionados.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
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

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getAdded(data: any): Purchase {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): Purchase {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): Purchase {
    return this.getOne(data);
  }

  /**
     * Prepara una compra para ser registrada.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: Purchase): any {
    return {
      userId: data.userId,
      totalPrice: data.totalPrice,
      status: data.status,
    };
  }

  /**
     * Prepara actualizaciones de estado o motivos de devolución.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.refundReason !== undefined)
      payload.refundReason = data.refundReason;
    return payload;
  }
}
