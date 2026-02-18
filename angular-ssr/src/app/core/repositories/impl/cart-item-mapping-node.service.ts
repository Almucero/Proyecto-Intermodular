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
      id: data.cartItemId || data.id,
      userId: data.userId || 0,
      gameId: data.id || data.gameId,
      platformId: data.platform?.id || data.platformId || 0,
      quantity: data.quantity || 1,
      user: data.user,
      game: {
        id: data.id || data.game?.id,
        title: data.title || data.game?.title,
        price: data.price ?? data.game?.price,
        isOnSale: data.isOnSale ?? data.game?.isOnSale,
        salePrice: data.salePrice ?? data.game?.salePrice,
        rating: data.rating ?? data.game?.rating,
        Developer: data.Developer || data.game?.Developer,
        Publisher: data.Publisher || data.game?.Publisher,
        media: data.media || data.game?.media || [],
        platforms: data.platforms || data.game?.platforms || [],
      } as any,
      platform: data.platform,
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
      platformId: data.platformId,
      quantity: data.quantity,
    };
  }

  setUpdate(data: any): any {
    const payload: any = {};
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.platformId !== undefined) payload.platformId = data.platformId;
    return payload;
  }
}
