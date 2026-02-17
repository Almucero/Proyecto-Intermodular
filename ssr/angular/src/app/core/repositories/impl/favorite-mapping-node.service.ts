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
      id: data.favoriteId || data.id,
      userId: data.userId || 0,
      gameId: data.id || data.gameId,
      platformId: data.platform?.id || data.platformId || 0,
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
      platformId: data.platformId,
    };
  }

  setUpdate(data: any): any {
    return {};
  }
}
