import { Observable } from 'rxjs';
import { Model } from '../../models/base.model';
export interface SearchParams {
  [key: string]: string; // O el tipo que necesites para los valores
}
export interface IBaseRepository<T extends Model> {
  getAll(filters: SearchParams): Observable<T[]>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<T>; // Retorna el ID generado
  update(id: string, entity: T): Observable<T>;
  delete(id: string): Observable<T>;
}
