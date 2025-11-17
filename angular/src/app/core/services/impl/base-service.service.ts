// src/app/services/impl/base-service.service.ts
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseService } from '../interfaces/base-service.interface';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class BaseService<T> implements IBaseService<T> {
  constructor(
    @Inject('REPOSITORY_TOKEN') protected repository: IBaseRepository<T>
  ) {}

  getAll(): Observable<T[]> {
    return this.repository.getAll();
  }

  getById(id: string): Observable<T | null> {
    return this.repository.getById(id);
  }

  add(entity: T): Observable<string> {
    return this.repository.add(entity);
  }

  update(id: string, entity: T): Observable<void> {
    return this.repository.update(id, entity);
  }

  delete(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
