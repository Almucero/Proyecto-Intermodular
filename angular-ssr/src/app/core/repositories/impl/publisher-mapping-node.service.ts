/**
 * @file: src/app/core/repositories/impl/publisher-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para distribuidoras de videojuegos desde un backend Node.js.
 */

import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Publisher } from '../../models/publisher.model';

/**
 * Servicio de mapeo para distribuidoras de videojuegos desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class PublisherMappingNodeService implements IBaseMapping<Publisher> {
  /**
   * Crea una instancia de PublisherMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de distribuidoras de la API.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos Publisher.
   */
  getAll(data: any): Publisher[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma una distribuidora única.
   * @param data Objeto crudo de distribuidora.
   * @returns Instancia estructurada de Publisher.
   */
  getOne(data: any): Publisher {
    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
   * Adapta y mapea la distribuidora tras ser creada.
   * @param data Distribuidora devuelta por la API tras creación.
   * @returns Objeto Publisher estructurado.
   */
  getAdded(data: any): Publisher {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la distribuidora tras ser actualizada.
   * @param data Distribuidora devuelta por la API tras edición.
   * @returns Objeto Publisher estructurado.
   */
  getUpdated(data: any): Publisher {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la distribuidora tras ser eliminada.
   * @param data Distribuidora devuelta por la API tras eliminación.
   * @returns Objeto Publisher estructurado.
   */
  getDeleted(data: any): Publisher {
    return this.getOne(data);
  }

  /**
   * Prepara una distribuidora para ser creada.
   * @param data Instancia de Publisher a guardar.
   * @returns Objeto serializado para el envío en el POST.
   */
  setAdd(data: Publisher): any {
    return {
      name: data.name,
    };
  }

  /**
   * Prepara los cambios para actualizar una distribuidora.
   * @param data Propiedades modificadas de la distribuidora.
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
