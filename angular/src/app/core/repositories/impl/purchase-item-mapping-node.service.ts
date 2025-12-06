import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { PurchaseItem } from '../../models/purchase-item.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseItemMappingNodeService
  implements IBaseMapping<PurchaseItem>
{
  constructor() {}

  getAll(data: any): PurchaseItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): PurchaseItem {
    return {
      id: data.id,
      purchaseId: data.purchaseId,
      gameId: data.gameId,
      price: data.price,
      quantity: data.quantity,
      purchase: data.purchase,
      game: data.game,
    };
  }

  getAdded(data: any): PurchaseItem {
    return this.getOne(data);
  }

  getUpdated(data: any): PurchaseItem {
    return this.getOne(data);
  }

  getDeleted(data: any): PurchaseItem {
    return this.getOne(data);
  }

  setAdd(data: PurchaseItem): any {
    return {
      purchaseId: data.purchaseId,
      gameId: data.gameId,
      price: data.price,
      quantity: data.quantity,
    };
  }

  setUpdate(data: any): any {
    return {};
  }
}
