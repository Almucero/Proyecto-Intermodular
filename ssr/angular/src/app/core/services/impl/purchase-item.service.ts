import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { PURCHASE_ITEM_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { PurchaseItem } from '../../models/purchase-item.model';
import { IPurchaseItemService } from '../interfaces/purchase-item-service.interface';

@Injectable({
  providedIn: 'root',
})
export class PurchaseItemService
  extends BaseService<PurchaseItem>
  implements IPurchaseItemService
{
  constructor(
    @Inject(PURCHASE_ITEM_REPOSITORY_TOKEN)
    repository: IBaseRepository<PurchaseItem>,
  ) {
    super(repository);
  }
}
