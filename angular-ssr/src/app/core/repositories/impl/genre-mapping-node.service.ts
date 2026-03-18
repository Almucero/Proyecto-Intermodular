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
  constructor() {}

  /** Transforma una lista de géneros. */
  getAll(data: any): Genre[] {
    return data.map((item: any) => this.getOne(item));
  }

  /** Transforma un género único. */
  getOne(data: any): Genre {
    return {
      id: data.id,
      name: data.name,
    };
  }

  getAdded(data: any): Genre {
    return this.getOne(data);
  }

  getUpdated(data: any): Genre {
    return this.getOne(data);
  }

  getDeleted(data: any): Genre {
    return this.getOne(data);
  }

  /** Prepara un género para ser creado. */
  setAdd(data: Genre): any {
    return {
      name: data.name,
    };
  }

  /** Prepara los cambios para actualizar un género. */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
