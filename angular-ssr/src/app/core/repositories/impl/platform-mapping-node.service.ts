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
  constructor() {}

  /** Transforma una lista de plataformas. */
  getAll(data: any): Platform[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma una plataforma única. */
  getOne(data: any): Platform {
    return {
      id: data.id,
      name: data.name,
    };
  }

  getAdded(data: any): Platform {
    return this.getOne(data);
  }

  getUpdated(data: any): Platform {
    return this.getOne(data);
  }

  getDeleted(data: any): Platform {
    return this.getOne(data);
  }

  /** Prepara una plataforma para ser creada. */
  setAdd(data: Platform): any {
    return {
      name: data.name,
    };
  }

  /** Prepara los cambios para actualizar una plataforma. */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
