import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { CartItem } from '../../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartItemMappingNodeService implements IBaseMapping<CartItem> {
  constructor() {}

  getAll(data: any): CartItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): CartItem {
    return {
      id: data.id,
      userId: data.userId,
      gameId: data.gameId,
      quantity: data.quantity,
      user: data.user,
      game: data.game,
    };
  }

  getAdded(data: any): CartItem {
    return this.getOne(data);
  }

  getUpdated(data: any): CartItem {
    return this.getOne(data);
  }

  getDeleted(data: any): CartItem {
    return this.getOne(data);
  }

  setAdd(data: CartItem): any {
    return {
      userId: data.userId,
      gameId: data.gameId,
      quantity: data.quantity,
    };
  }

  setUpdate(data: any): any {
    const payload: any = {};
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    return payload;
  }
}
