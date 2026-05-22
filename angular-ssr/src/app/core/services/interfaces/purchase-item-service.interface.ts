/**
 * @file: src/app/core/services/interfaces/purchase-item-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de artículos de compra.
 */

import { PurchaseItem } from '../../models/purchase-item.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de artículos de compra.
 */
export interface IPurchaseItemService extends IBaseService<PurchaseItem> { }
