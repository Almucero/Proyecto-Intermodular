/**
 * @file: src/app/core/repositories/interfaces/purchase-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de compras.
 */

import { Purchase } from '../../models/purchase.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de compras.
 */
export interface IPurchaseRepository extends IBaseRepository<Purchase> { }
