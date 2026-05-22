/**
 * @file: src/app/core/repositories/impl/purchase-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para compras desde un backend Node.js.
 */

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
  /**
   * Crea una instancia de PurchaseMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de compras.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos Purchase.
   */
  getAll(data: any): Purchase[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma una compra única, incluyendo sus artículos relacionados.
   * @param data Objeto crudo de compra devuelto por la API.
   * @returns Instancia estructurada de Purchase.
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
   * Adapta y mapea la compra tras ser creada.
   * @param data Compra devuelta por la API tras creación.
   * @returns Objeto Purchase estructurado.
   */
  getAdded(data: any): Purchase {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la compra tras ser actualizada.
   * @param data Compra devuelta por la API tras edición.
   * @returns Objeto Purchase estructurado.
   */
  getUpdated(data: any): Purchase {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la compra tras ser eliminada.
   * @param data Compra devuelta por la API tras eliminación.
   * @returns Objeto Purchase estructurado.
   */
  getDeleted(data: any): Purchase {
    return this.getOne(data);
  }

  /**
   * Prepara una compra para ser registrada.
   * @param data Instancia de Purchase a guardar.
   * @returns Objeto serializado para el envío en el POST.
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
   * @param data Propiedades modificadas de la compra.
   * @returns Objeto con los datos serializados para PATCH.
   */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.refundReason !== undefined)
      payload.refundReason = data.refundReason;
    return payload;
  }
}
