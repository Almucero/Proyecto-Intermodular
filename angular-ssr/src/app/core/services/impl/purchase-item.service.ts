import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { PURCHASE_ITEM_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { PurchaseItem } from '../../models/purchase-item.model';
import { IPurchaseItemService } from '../interfaces/purchase-item-service.interface';

/**
 * Servicio para la gestión de artículos individuales dentro de un pedido de compra.
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseItemService
  extends BaseService<PurchaseItem>
  implements IPurchaseItemService
{
  /**
   * @param repository Repositorio de artículos de compra inyectado.
   */
  constructor(
    @Inject(PURCHASE_ITEM_REPOSITORY_TOKEN)
    repository: IBaseRepository<PurchaseItem>,
  ) {
    super(repository);
  }
}
