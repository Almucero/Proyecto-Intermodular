import { PurchaseItem } from '../../models/purchase-item.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de artículos de compra.
 */
export interface IPurchaseItemRepository extends IBaseRepository<PurchaseItem> {}
