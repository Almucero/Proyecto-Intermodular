/**
 * @file: src/app/core/repositories/impl/media-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para medios desde un backend Node.js.
 */

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
  /**
   * Crea una instancia de MediaMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de medios.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos Media.
   */
  getAll(data: any): Media[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma un objeto media único de la API al modelo de la aplicación.
   * @param data Objeto de medio crudo devuelto por la API.
   * @returns Instancia de tipo Media.
   */
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

  /**
   * Adapta y mapea el objeto tras ser creado exitosamente.
   * @param data Objeto crudo del medio creado.
   * @returns Instancia de tipo Media.
   */
  getAdded(data: any): Media {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el objeto tras ser actualizado.
   * @param data Objeto crudo del medio actualizado.
   * @returns Instancia de tipo Media.
   */
  getUpdated(data: any): Media {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el objeto tras ser eliminado.
   * @param data Objeto crudo del medio eliminado.
   * @returns Instancia de tipo Media.
   */
  getDeleted(data: any): Media {
    return this.getOne(data);
  }

  /**
   * Prepara un medio para ser creado.
   * @param data Instancia del modelo Media a enviar.
   * @returns Objeto JSON mapeado para el POST.
   */
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

  /**
   * Prepara actualizaciones parciales (ej: cambiar el texto alternativo).
   * @param data Objeto parcial de medio con los cambios.
   * @returns Objeto JSON adaptado para PATCH.
   */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.altText !== undefined) payload.altText = data.altText;
    return payload;
  }
}
