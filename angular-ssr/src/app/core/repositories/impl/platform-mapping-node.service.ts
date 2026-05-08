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
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de plataformas.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): Platform[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma una plataforma única.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getOne(data: any): Platform {
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
    getAdded(data: any): Platform {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): Platform {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): Platform {
    return this.getOne(data);
  }

  /**
     * Prepara una plataforma para ser creada.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: Platform): any {
    return {
      name: data.name,
    };
  }

  /**
     * Prepara los cambios para actualizar una plataforma.
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
