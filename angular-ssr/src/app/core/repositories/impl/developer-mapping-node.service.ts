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
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de desarrolladoras de la API.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): Developer[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma una desarrolladora única.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getOne(data: any): Developer {
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
    getAdded(data: any): Developer {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): Developer {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): Developer {
    return this.getOne(data);
  }

  /**
     * Prepara una desarrolladora para ser creada.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: Developer): any {
    return {
      name: data.name,
    };
  }

  /**
     * Prepara los cambios para actualizar una desarrolladora.
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
