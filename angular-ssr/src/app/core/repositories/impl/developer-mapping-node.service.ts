/**
 * @file: src/app/core/repositories/impl/developer-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de mapeo para desarrolladoras desde un backend Node.js.
 */

import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Developer } from '../../models/developer.model';

/**
 * Servicio de mapeo para desarrolladoras desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class DeveloperMappingNodeService implements IBaseMapping<Developer> {
  /**
   * Crea una instancia de DeveloperMappingNodeService.
   */
  constructor() { }

  /**
   * Transforma una lista de desarrolladoras de la API.
   * @param data Listado crudo devuelto por la API.
   * @returns Lista estructurada de objetos Developer.
   */
  getAll(data: any): Developer[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma una desarrolladora única.
   * @param data Objeto crudo de desarrolladora.
   * @returns Instancia estructurada de Developer.
   */
  getOne(data: any): Developer {
    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
   * Adapta y mapea la desarrolladora tras ser creada.
   * @param data Desarrolladora devuelta por la API tras creación.
   * @returns Objeto Developer estructurado.
   */
  getAdded(data: any): Developer {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la desarrolladora tras ser actualizada.
   * @param data Desarrolladora devuelta por la API tras edición.
   * @returns Objeto Developer estructurado.
   */
  getUpdated(data: any): Developer {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea la desarrolladora tras ser eliminada.
   * @param data Desarrolladora devuelta por la API tras eliminación.
   * @returns Objeto Developer estructurado.
   */
  getDeleted(data: any): Developer {
    return this.getOne(data);
  }

  /**
   * Prepara una desarrolladora para ser creada.
   * @param data Instancia de Developer a guardar.
   * @returns Objeto serializado para el envío en el POST.
   */
  setAdd(data: Developer): any {
    return {
      name: data.name,
    };
  }

  /**
   * Prepara los cambios para actualizar una desarrolladora.
   * @param data Propiedades modificadas de la desarrolladora.
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
