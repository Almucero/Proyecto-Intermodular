import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Game } from '../../models/game.model';
import { Genre } from '../../models/genre.model';
import { Platform } from '../../models/platform.model';
import { Media } from '../../models/media.model';
import { Developer } from '../../models/developer.model';
import { Publisher } from '../../models/publisher.model';

@Injectable({
  providedIn: 'root',
})
export class GameMappingNodeService implements IBaseMapping<Game> {
  constructor() {}

  getAll(data: any): Game[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): Game {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      isOnSale: data.isOnSale,
      salePrice: data.salePrice,
      isRefundable: data.isRefundable,
      numberOfSales: data.numberOfSales,
      stock: data.stock,
      videoUrl: data.videoUrl,
      rating: data.rating,
      releaseDate: data.releaseDate,
      publisherId: data.publisherId,
      developerId: data.developerId,
      genres:
        data.genres?.map((g: any) => ({ id: g.id, name: g.name } as Genre)) ||
        [],
      platforms:
        data.platforms?.map(
          (p: any) => ({ id: p.id, name: p.name } as Platform)
        ) || [],
      media:
        data.media?.map(
          (m: any) =>
            ({
              id: m.id,
              url: m.url,
              altText: m.altText,
              originalName: m.originalName,
            } as Media)
        ) || [],
      Publisher: data.Publisher
        ? ({ id: data.Publisher.id, name: data.Publisher.name } as Publisher)
        : data.publisher
        ? ({ id: data.publisher.id, name: data.publisher.name } as Publisher)
        : undefined,
      Developer: data.Developer
        ? ({ id: data.Developer.id, name: data.Developer.name } as Developer)
        : data.developer
        ? ({ id: data.developer.id, name: data.developer.name } as Developer)
        : undefined,
    };
  }

  getAdded(data: any): Game {
    return this.getOne(data);
  }

  getUpdated(data: any): Game {
    return this.getOne(data);
  }

  getDeleted(data: any): Game {
    return this.getOne(data);
  }

  setAdd(data: Game): any {
    const payload: any = {
      title: data.title,
      description: data.description,
      price: data.price,
      isOnSale: data.isOnSale,
      salePrice: data.salePrice,
      isRefundable: data.isRefundable,
      stock: data.stock,
      videoUrl: data.videoUrl,
      releaseDate: data.releaseDate,
      publisherId: data.publisherId,
      developerId: data.developerId,
    };

    if (data.genres) {
      payload.genres = data.genres.map((g) => g.id || g.name); // Send ID or name depending on backend expectation, usually IDs for connect
    }
    if (data.platforms) {
      payload.platforms = data.platforms.map((p) => p.id || p.name);
    }

    return payload;
  }

  setUpdate(data: any): any {
    const payload: any = { ...data };

    // Clean up relations for update if they exist in data
    if (data.genres) {
      payload.genres = data.genres.map((g: any) => g.id || g.name);
    }
    if (data.platforms) {
      payload.platforms = data.platforms.map((p: any) => p.id || p.name);
    }

    // Remove read-only or nested object fields that shouldn't be sent directly
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.Publisher;
    delete payload.Developer;
    delete payload.media; // Media usually handled separately or via specific endpoints

    return payload;
  }
}
