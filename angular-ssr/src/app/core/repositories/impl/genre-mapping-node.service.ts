/**
 * @file: src/app/core/repositories/impl/genre-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para géneros de videojuegos desde un backend Node.js.
 */

import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Genre } from '../../models/genre.model';

/**
 * Servicio de mapeo para géneros de videojuegos desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class GenreMappingNodeService implements IBaseMapping<Genre> {
  /**
   * Crea una instancia de GenreMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de géneros.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos Genre.
   */
  getAll(data: any): Genre[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma un género único.
   * @param data Objeto crudo de género.
   * @returns Instancia estructurada de Genre.
   */
  getOne(data: any): Genre {
    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
   * Adapta y mapea el género tras ser creado.
   * @param data Género devuelto por la API tras creación.
   * @returns Objeto Genre estructurado.
   */
  getAdded(data: any): Genre {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el género tras ser actualizado.
   * @param data Género devuelto por la API tras edición.
   * @returns Objeto Genre estructurado.
   */
  getUpdated(data: any): Genre {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el género tras ser eliminado.
   * @param data Género devuelto por la API tras eliminación.
   * @returns Objeto Genre estructurado.
   */
  getDeleted(data: any): Genre {
    return this.getOne(data);
  }

  /**
   * Prepara un género para ser creado.
   * @param data Instancia de Genre a guardar.
   * @returns Objeto serializado para el envío en el POST.
   */
  setAdd(data: Genre): any {
    return {
      name: data.name,
    };
  }

  /**
   * Prepara los cambios para actualizar un género.
   * @param data Propiedades modificadas del género.
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
