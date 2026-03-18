import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { CartItem } from '../../models/cart-item.model';

/**
 * Servicio de mapeo para los artículos del carrito desde un backend Node.js.
 * Transforma los datos de la API al modelo {@link CartItem} y viceversa.
 */
@Injectable({
  providedIn: 'root',
})
export class CartItemMappingNodeService implements IBaseMapping<CartItem> {
  /**
   * Transforma una lista de artículos provenientes de la API.
   * @param data Datos sin procesar de la API.
   */
  getAll(data: any): CartItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma un único artículo del carrito de la API al modelo de la aplicación.
   * Maneja diferentes estructuras posibles (mapeo defensivo).
   * @param data Objeto de la API.
   */
  getOne(data: any): CartItem {
    return {
      id: data.cartItemId || data.id,
      userId: data.userId || 0,
      gameId: data.id || data.gameId,
      platformId: data.platform?.id || data.platformId || 0,
      quantity: data.quantity || 1,
      user: data.user,
      game: {
        id: data.id || data.game?.id,
        title: data.title || data.game?.title,
        price: data.price ?? data.game?.price,
        isOnSale: data.isOnSale ?? data.game?.isOnSale,
        salePrice: data.salePrice ?? data.game?.salePrice,
        rating: data.rating ?? data.game?.rating,
        Developer: data.Developer || data.game?.Developer,
        Publisher: data.Publisher || data.game?.Publisher,
        media: data.media || data.game?.media || [],
        platforms: data.platforms || data.game?.platforms || [],
      } as any,
      platform: data.platform,
    };
  }

  /** Transforma la respuesta de creación al modelo. */
  getAdded(data: any): CartItem {
    return this.getOne(data);
  }

  /** Transforma la respuesta de actualización al modelo. */
  getUpdated(data: any): CartItem {
    return this.getOne(data);
  }

  /** Transforma la respuesta de eliminación al modelo. */
  getDeleted(data: any): CartItem {
    return this.getOne(data);
  }

  /**
   * Prepara los datos del modelo para ser enviados en una creación.
   * @param data Modelo del artículo del carrito.
   */
  setAdd(data: CartItem): any {
    return {
      userId: data.userId,
      gameId: data.gameId,
      platformId: data.platformId,
      quantity: data.quantity,
    };
  }

  /**
   * Prepara los datos para una actualización parcial.
   * @param data Atributos a actualizar.
   */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.platformId !== undefined) payload.platformId = data.platformId;
    return payload;
  }
}
