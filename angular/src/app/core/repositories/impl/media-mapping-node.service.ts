import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Media } from '../../models/media.model';

@Injectable({
  providedIn: 'root',
})
export class MediaMappingNodeService implements IBaseMapping<Media> {
  constructor() {}

  getAll(data: any): Media[] {
    return data.map((item: any) => this.getOne(item));
  }

  getOne(data: any): Media {
    return {
      id: data.id,
      url: data.url,
      publicId: data.publicId,
      format: data.format,
      resourceType: data.resourceType,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      originalName: data.originalName,
      folder: data.folder,
      altText: data.altText,
      gameId: data.gameId,
      userId: data.userId,
    };
  }

  getAdded(data: any): Media {
    return this.getOne(data);
  }

  getUpdated(data: any): Media {
    return this.getOne(data);
  }

  getDeleted(data: any): Media {
    return this.getOne(data);
  }

  setAdd(data: Media): any {
    return {
      url: data.url,
      publicId: data.publicId,
      format: data.format,
      resourceType: data.resourceType,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      originalName: data.originalName,
      folder: data.folder,
      altText: data.altText,
      gameId: data.gameId,
      userId: data.userId,
    };
  }

  setUpdate(data: any): any {
    const payload: any = {};
    if (data.altText !== undefined) payload.altText = data.altText;
    return payload;
  }
}
