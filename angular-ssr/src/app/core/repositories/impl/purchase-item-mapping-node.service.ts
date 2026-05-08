import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { PurchaseItem } from '../../models/purchase-item.model';

/**
 * Servicio de mapeo para los artículos individuales de una compra (PurchaseItem) desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseItemMappingNodeService implements IBaseMapping<PurchaseItem> {
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de artículos de compra.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): PurchaseItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma un único artículo de compra, incluyendo datos básicos del juego.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getOne(data: any): PurchaseItem {
    return {
      id: data.itemId || data.id,
      purchaseId: data.purchaseId,
      gameId: data.gameId || data.id,
      platformId: data.platform?.id || data.platformId || 0,
      price: data.purchasePrice || data.price,
      quantity: data.quantity || 1,
      purchase: data.purchase,
      game: data.game || {
        id: data.id,
        title: data.title,
        price: data.price,
        rating: data.rating,
        key: data.key ?? null,
      },
      platform: data.platform,
      key: data.key ?? data.game?.key ?? null,
    };
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getAdded(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /**
     * Prepara los datos para añadir un artículo a una compra.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: PurchaseItem): any {
    return {
      purchaseId: data.purchaseId,
      gameId: data.gameId,
      platformId: data.platformId,
      price: data.price,
      quantity: data.quantity,
    };
  }

  /**
     * No se suelen actualizar artículos de compra individuales directamente.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setUpdate(data: any): any {
    return {};
  }
}
