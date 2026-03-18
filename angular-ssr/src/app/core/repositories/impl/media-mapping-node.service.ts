import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Media } from '../../models/media.model';

/**
 * Servicio de mapeo para medios (imágenes/vídeos) desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class MediaMappingNodeService implements IBaseMapping<Media> {
  constructor() {}

  /** Transforma una lista de medios. */
  getAll(data: any): Media[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma un objeto media único de la API al modelo de la aplicación. */
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

  /** Prepara un medio para ser creado. */
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

  /** Prepara actualizaciones parciales (ej: cambiar el texto alternativo). */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.altText !== undefined) payload.altText = data.altText;
    return payload;
  }
}
