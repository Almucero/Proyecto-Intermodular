import { Purchase } from '../../models/purchase.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de compras.
 */
export interface IPurchaseRepository extends IBaseRepository<Purchase> {}
