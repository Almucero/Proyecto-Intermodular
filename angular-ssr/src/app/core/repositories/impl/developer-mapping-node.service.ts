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
  constructor() {}

  /** Transforma una lista de desarrolladoras de la API. */
  getAll(data: any): Developer[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma una desarrolladora única. */
  getOne(data: any): Developer {
    return {
      id: data.id,
      name: data.name,
    };
  }

  getAdded(data: any): Developer {
    return this.getOne(data);
  }

  getUpdated(data: any): Developer {
    return this.getOne(data);
  }

  getDeleted(data: any): Developer {
    return this.getOne(data);
  }

  /** Prepara una desarrolladora para ser creada. */
  setAdd(data: Developer): any {
    return {
      name: data.name,
    };
  }

  /** Prepara los cambios para actualizar una desarrolladora. */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
