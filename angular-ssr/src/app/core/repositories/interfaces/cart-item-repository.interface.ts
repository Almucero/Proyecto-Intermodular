/**
 * @file: src/app/core/repositories/interfaces/cart-item-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de artículos del carrito.
 */

import { CartItem } from '../../models/cart-item.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de artículos del carrito.
 */
export interface ICartItemRepository extends IBaseRepository<CartItem> { }
