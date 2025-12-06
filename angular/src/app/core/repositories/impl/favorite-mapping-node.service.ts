import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Favorite } from '../../models/favorite.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteMappingNodeService implements IBaseMapping<Favorite> {
  getAll(data: any): Favorite[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): Favorite {
    return {
      id: data.favoriteId,
      userId: data.userId || 0,
      gameId: data.id,
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

  getAdded(data: any): Favorite {
    return this.getOne(data);
  }

  getUpdated(data: any): Favorite {
    return this.getOne(data);
  }

  getDeleted(data: any): Favorite {
    return this.getOne(data);
  }

  setAdd(data: Favorite): any {
    return {
      userId: data.userId,
      gameId: data.gameId,
    };
  }

  setUpdate(data: any): any {
    return {};
  }
}
