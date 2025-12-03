import { Observable } from 'rxjs';
import { Model } from '../../models/base.model';
export interface SearchParams {
  [key: string]: string;
}
export interface IBaseRepository<T extends Model> {
  getAll(filters: SearchParams): Observable<T[]>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<T>;
  update(id: string, entity: T): Observable<T>;
  delete(id: string): Observable<T>;
}
