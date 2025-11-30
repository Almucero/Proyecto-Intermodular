import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Publisher } from '../../models/publisher.model';

@Injectable({
  providedIn: 'root',
})
export class PublisherMappingNodeService implements IBaseMapping<Publisher> {
  constructor() {}

  getAll(data: any): Publisher[] {
    return data.map((item: any) => this.getOne(item));
  }

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

  setAdd(data: Publisher): any {
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
