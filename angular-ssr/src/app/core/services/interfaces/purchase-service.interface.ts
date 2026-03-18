import { Purchase } from '../../models/purchase.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de compras.
 */
export interface IPurchaseService extends IBaseService<Purchase> {}
