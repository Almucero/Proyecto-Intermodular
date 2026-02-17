import { Observable } from 'rxjs';
import { SearchParams } from '../../repositories/interfaces/base-repository.interface';

export interface IBaseService<T> {
  getAll(): Observable<T[]>;
  getAll(filters?: SearchParams): Observable<T[]>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<T>;
  update(id: string, entity: T): Observable<T>;
  delete(id: string): Observable<T>;
}
