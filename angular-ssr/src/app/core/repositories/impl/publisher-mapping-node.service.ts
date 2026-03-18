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
  constructor() {}

  /** Transforma una lista de distribuidoras. */
  getAll(data: any): Publisher[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma una distribuidora única. */
  getOne(data: any): Publisher {
    return {
      id: data.id,
      name: data.name,
    };
  }

  getAdded(data: any): Publisher {
    return this.getOne(data);
  }

  getUpdated(data: any): Publisher {
    return this.getOne(data);
  }

  getDeleted(data: any): Publisher {
    return this.getOne(data);
  }

  /** Prepara una distribuidora para ser creada. */
  setAdd(data: Publisher): any {
    return {
      name: data.name,
    };
  }

  /** Prepara los cambios para actualizar una distribuidora. */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
