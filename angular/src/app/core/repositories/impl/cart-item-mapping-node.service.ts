import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { CartItem } from '../../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartItemMappingNodeService implements IBaseMapping<CartItem> {
  getAll(data: any): CartItem[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): CartItem {
    return {
      id: data.cartItemId,
      userId: data.userId || 0,
      gameId: data.id,
      quantity: data.quantity,
      user: data.user,
      game: {
        id: data.id,
        title: data.title,
        price: data.price,
        isOnSale: data.isOnSale,
        salePrice: data.salePrice,
        rating: data.rating,
        Developer: data.Developer,
        Publisher: data.Publisher,
        media: [],
        platforms: [],
      } as any,
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
