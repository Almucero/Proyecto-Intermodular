/**
 * @file: src/app/core/repositories/impl/platform-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para plataformas de videojuegos desde un backend Node.js.
 */

import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Platform } from '../../models/platform.model';

/**
 * Servicio de mapeo para plataformas de videojuegos desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class PlatformMappingNodeService implements IBaseMapping<Platform> {
  /**
   * Crea una instancia de PlatformMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de plataformas de la API.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos Platform.
   */
  getAll(data: any): Platform[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma una plataforma única.
   * @param data Objeto crudo de plataforma.
   * @returns Instancia estructurada de Platform.
   */
  getOne(data: any): Platform {
    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
   * Adapta y mapea la plataforma tras ser creada.
   * @param data Plataforma devuelta por la API tras creación.
   * @returns Objeto Platform estructurado.
   */
  getAdded(data: any): Platform {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la plataforma tras ser actualizada.
   * @param data Plataforma devuelta por la API tras edición.
   * @returns Objeto Platform estructurado.
   */
  getUpdated(data: any): Platform {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la plataforma tras ser eliminada.
   * @param data Plataforma devuelta por la API tras eliminación.
   * @returns Objeto Platform estructurado.
   */
  getDeleted(data: any): Platform {
    return this.getOne(data);
  }

  /**
   * Prepara una plataforma para ser creada.
   * @param data Instancia de Platform a guardar.
   * @returns Objeto serializado para el envío en el POST.
   */
  setAdd(data: Platform): any {
    return {
      name: data.name,
    };
  }

  /**
   * Prepara los cambios para actualizar una plataforma.
   * @param data Propiedades modificadas de la plataforma.
   * @returns Objeto con los datos serializados para PATCH.
   */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
