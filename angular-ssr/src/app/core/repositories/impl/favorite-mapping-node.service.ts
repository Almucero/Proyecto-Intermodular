/**
 * @file: src/app/core/repositories/impl/favorite-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para favoritos desde un backend Node.js.
 */

import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Favorite } from '../../models/favorite.model';

/**
 * Servicio de mapeo para favoritos desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class FavoriteMappingNodeService implements IBaseMapping<Favorite> {
  /**
   * Transforma una lista de favoritos provenientes de la API.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de favoritos.
   */
  getAll(data: any): Favorite[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma un único favorito de la API al modelo de la aplicación.
   * @param data Objeto crudo de favorito proveniente de la API.
   * @returns Instancia estructurada de Favorite.
   */
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

  /**
   * Adapta y mapea el favorito tras ser añadido.
   * @param data Favorito devuelto por la API tras creación.
   * @returns Objeto Favorite estructurado.
   */
  getAdded(data: any): Favorite {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el favorito tras ser modificado.
   * @param data Favorito devuelto por la API tras edición.
   * @returns Objeto Favorite estructurado.
   */
  getUpdated(data: any): Favorite {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el favorito tras ser eliminado.
   * @param data Favorito devuelto por la API tras eliminación.
   * @returns Objeto Favorite estructurado.
   */
  getDeleted(data: any): Favorite {
    return this.getOne(data);
  }

  /**
   * Prepara un favorito para ser creado.
   * @param data Instancia de Favorite a guardar.
   * @returns Objeto serializado para el POST.
   */
  setAdd(data: Favorite): any {
    return {
      userId: data.userId,
      gameId: data.gameId,
      platformId: data.platformId,
    };
  }

  /**
   * No aplicable para favoritos.
   * @param data Cambios o propiedades del favorito a modificar.
   * @returns Objeto vacío.
   */
  setUpdate(data: any): any {
    return {};
  }
}
