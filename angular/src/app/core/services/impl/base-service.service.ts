import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IBaseService } from '../interfaces/base-service.interface';
import {
  IBaseRepository,
  SearchParams,
} from '../../repositories/interfaces/base-repository.interface';
import { Model } from '../../models/base.model';
import { REPOSITORY_TOKEN } from '../../repositories/repository.tokens';

@Injectable({
  providedIn: 'root',
})
export class BaseService<T extends Model> implements IBaseService<T> {
  constructor(
    @Inject(REPOSITORY_TOKEN) protected repository: IBaseRepository<T>
  ) {}

  getAll(filters?: SearchParams): Observable<T[]> {
    return this.repository.getAll(filters ?? {});
  }

  getById(id: string): Observable<T | null> {
    return this.repository.getById(id);
  }

  add(entity: T): Observable<T> {
    return this.repository.add(entity);
  }

  update(id: string, entity: T): Observable<T> {
    return this.repository.update(id, entity);
  }

  delete(id: string): Observable<T> {
    return this.repository.delete(id);
  }
}
