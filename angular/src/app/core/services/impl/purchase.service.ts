import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { PURCHASE_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Purchase } from '../../models/purchase.model';
import { IPurchaseService } from '../interfaces/purchase-service.interface';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService
  extends BaseService<Purchase>
  implements IPurchaseService
{
  constructor(
    @Inject(PURCHASE_REPOSITORY_TOKEN) repository: IBaseRepository<Purchase>
  ) {
    super(repository);
  }
}
