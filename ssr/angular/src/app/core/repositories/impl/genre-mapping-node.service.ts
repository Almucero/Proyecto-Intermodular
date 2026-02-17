import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Genre } from '../../models/genre.model';

@Injectable({
  providedIn: 'root',
})
export class GenreMappingNodeService implements IBaseMapping<Genre> {
  constructor() {}

  getAll(data: any): Genre[] {
    return data.map((item: any) => this.getOne(item));
  }

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

  setAdd(data: Genre): any {
    return {
      name: data.name,
    };
  }

  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) {
      payload.name = data.name;
    }
    return payload;
  }
}
