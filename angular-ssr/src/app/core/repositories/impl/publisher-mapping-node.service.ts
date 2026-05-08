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
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de distribuidoras.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): Publisher[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma una distribuidora única.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getOne(data: any): Publisher {
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
    getAdded(data: any): Publisher {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): Publisher {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): Publisher {
    return this.getOne(data);
  }

  /**
     * Prepara una distribuidora para ser creada.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: Publisher): any {
    return {
      name: data.name,
    };
  }

  /**
     * Prepara los cambios para actualizar una distribuidora.
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
