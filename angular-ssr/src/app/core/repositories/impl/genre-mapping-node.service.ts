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
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de géneros.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): Genre[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma un género único.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getOne(data: any): Genre {
    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getAdded(data: any): Genre {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): Genre {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): Genre {
    return this.getOne(data);
  }

  /**
     * Prepara un género para ser creado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: Genre): any {
    return {
      name: data.name,
    };
  }

  /**
     * Prepara los cambios para actualizar un género.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
