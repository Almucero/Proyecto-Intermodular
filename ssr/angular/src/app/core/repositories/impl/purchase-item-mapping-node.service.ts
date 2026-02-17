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
      id: data.itemId || data.id,
      purchaseId: data.purchaseId,
      gameId: data.gameId || data.id,
      platformId: data.platform?.id || data.platformId || 0,
      price: data.purchasePrice || data.price,
      quantity: data.quantity || 1,
      purchase: data.purchase,
      game: data.game || {
        id: data.id,
        title: data.title,
        price: data.price,
        rating: data.rating,
      },
      platform: data.platform,
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
      platformId: data.platformId,
      price: data.price,
      quantity: data.quantity,
    };
  }

  setUpdate(data: any): any {
    return {};
  }
}
