import { PurchaseItem } from '../../models/purchase-item.model';
import { IBaseRepository } from './base-repository.interface';

export interface IPurchaseItemRepository
  extends IBaseRepository<PurchaseItem> {}
