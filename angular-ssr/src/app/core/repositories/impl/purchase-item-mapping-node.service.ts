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
  constructor() {}

  /** Transforma una lista de artículos de compra. */
  getAll(data: any): PurchaseItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma un único artículo de compra, incluyendo datos básicos del juego. */
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

  getAdded(data: any): PurchaseItem {
    return this.getOne(data);
  }

  getUpdated(data: any): PurchaseItem {
    return this.getOne(data);
  }

  getDeleted(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /** Prepara los datos para añadir un artículo a una compra. */
  setAdd(data: PurchaseItem): any {
    return {
      purchaseId: data.purchaseId,
      gameId: data.gameId,
      platformId: data.platformId,
      price: data.price,
      quantity: data.quantity,
    };
  }

  /** No se suelen actualizar artículos de compra individuales directamente. */
  setUpdate(data: any): any {
    return {};
  }
}
