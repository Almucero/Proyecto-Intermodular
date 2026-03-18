import { PurchaseItem } from '../../models/purchase-item.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de artículos de compra.
 */
export interface IPurchaseItemService extends IBaseService<PurchaseItem> {}
