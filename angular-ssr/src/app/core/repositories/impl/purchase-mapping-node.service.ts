import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Purchase } from '../../models/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseMappingNodeService implements IBaseMapping<Purchase> {
  constructor() {}

  getAll(data: any): Purchase[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): Purchase {
    return {
      id: data.id,
      userId: data.userId,
      totalPrice: data.totalPrice,
      status: data.status,
      refundReason: data.refundReason,
      purchasedAt: data.purchasedAt,
      user: data.user,
      items: data.items,
    };
  }

  getAdded(data: any): Purchase {
    return this.getOne(data);
  }

  getUpdated(data: any): Purchase {
    return this.getOne(data);
  }

  getDeleted(data: any): Purchase {
    return this.getOne(data);
  }

  setAdd(data: Purchase): any {
    return {
      userId: data.userId,
      totalPrice: data.totalPrice,
      status: data.status,
    };
  }

  setUpdate(data: any): any {
    const payload: any = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.refundReason !== undefined)
      payload.refundReason = data.refundReason;
    return payload;
  }
}
