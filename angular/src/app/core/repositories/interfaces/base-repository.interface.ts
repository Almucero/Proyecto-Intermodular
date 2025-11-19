import { Observable } from 'rxjs';

export interface IBaseRepository<T> {
  getAll(): Observable<T[]>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<string>; // Retorna el ID generado
  update(id: string, entity: T): Observable<void>;
  delete(id: string): Observable<void>;
}
