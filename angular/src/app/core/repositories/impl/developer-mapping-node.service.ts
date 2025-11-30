import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Developer } from '../../models/developer.model';

@Injectable({
  providedIn: 'root',
})
export class DeveloperMappingNodeService implements IBaseMapping<Developer> {
  constructor() {}

  getAll(data: any): Developer[] {
    return data.map((item: any) => this.getOne(item));
  }

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

  setAdd(data: Developer): any {
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
