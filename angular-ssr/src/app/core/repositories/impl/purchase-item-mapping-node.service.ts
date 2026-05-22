/**
 * @file: src/app/core/repositories/impl/purchase-item-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para los artículos individuales de una compra.
 */

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
  /**
   * Crea una instancia de PurchaseItemMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de artículos de compra.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos PurchaseItem.
   */
  getAll(data: any): PurchaseItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma un único artículo de compra, incluyendo datos básicos del juego.
   * @param data Objeto crudo del artículo de compra devuelto por la API.
   * @returns Instancia estructurada de PurchaseItem.
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
   * Adapta y mapea el artículo tras ser creado exitosamente.
   * @param data Objeto crudo del artículo creado.
   * @returns Instancia de tipo PurchaseItem.
   */
  getAdded(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el artículo tras ser actualizado.
   * @param data Objeto crudo del artículo actualizado.
   * @returns Instancia de tipo PurchaseItem.
   */
  getUpdated(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el artículo tras ser eliminado.
   * @param data Objeto crudo del artículo eliminado.
   * @returns Instancia de tipo PurchaseItem.
   */
  getDeleted(data: any): PurchaseItem {
    return this.getOne(data);
  }

  /**
   * Prepara los datos para añadir un artículo a una compra.
   * @param data Instancia de PurchaseItem a guardar.
   * @returns Objeto serializado para el envío en el POST.
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
   * @param data Cambios a realizar en el artículo.
   * @returns Objeto vacío o payload serializado.
   */
  setUpdate(data: any): any {
    return {};
  }
}
