/**
 * @file: src/app/core/services/interfaces/cart-item-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de carrito de compras.
 */

import { Observable } from 'rxjs';
import { CartItem } from '../../models/cart-item.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define las operaciones específicas para el servicio de carrito.
 */
export interface ICartItemService extends IBaseService<CartItem> {
  /**
   * Añade un artículo al carrito.
   * @param entity El artículo a añadir.
   * @returns Observable con el resultado.
   */
  add(entity: CartItem): Observable<CartItem>;
}
