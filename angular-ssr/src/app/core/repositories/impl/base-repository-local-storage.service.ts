import { Injectable, Inject } from '@angular/core';
import {
  IBaseRepository,
  SearchParams,
} from '../interfaces/base-repository.interface';
import { Model } from '../../models/base.model';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import {
  RESOURCE_NAME_TOKEN,
  REPOSITORY_MAPPING_TOKEN,
} from '../repository.tokens';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseRepositoryLocalStorageService<
  T extends Model,
> implements IBaseRepository<T> {
  constructor(
    @Inject(RESOURCE_NAME_TOKEN) protected resource: string,
    @Inject(REPOSITORY_MAPPING_TOKEN) protected mapping: IBaseMapping<T>,
  ) {}

  getAll(filters: SearchParams): Observable<T[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Observable<T | null> {
    throw new Error('Method not implemented.');
  }
  add(entity: T): Observable<T> {
    throw new Error('Method not implemented.');
  }
  update(id: string, entity: T): Observable<T> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Observable<T> {
    throw new Error('Method not implemented.');
  }
}
