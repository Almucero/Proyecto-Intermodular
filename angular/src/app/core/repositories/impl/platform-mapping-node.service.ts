import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { Platform } from '../../models/platform.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformMappingNodeService implements IBaseMapping<Platform> {
  constructor() {}

  getAll(data: any): Platform[] {
    return data.map((item: any) => this.getOne(item));
  }

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

  setAdd(data: Platform): any {
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
