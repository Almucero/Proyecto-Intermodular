import { Observable } from 'rxjs';

export interface IBaseService<T> {
  getAll(): Observable<T[]>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<string>;
  update(id: string, entity: T): Observable<void>;
  delete(id: string): Observable<void>;
}
