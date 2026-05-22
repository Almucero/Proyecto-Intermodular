/**
 * @file: src/app/core/repositories/interfaces/purchase-item-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de artículos de compra.
 */

import { PurchaseItem } from '../../models/purchase-item.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de artículos de compra.
 */
export interface IPurchaseItemRepository extends IBaseRepository<PurchaseItem> { }
