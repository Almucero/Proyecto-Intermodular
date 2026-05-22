/**
 * @file: src/app/core/services/interfaces/purchase-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de compras.
 */

import { Purchase } from '../../models/purchase.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de compras.
 */
export interface IPurchaseService extends IBaseService<Purchase> { }
