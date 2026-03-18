import { Observable } from 'rxjs';
import { SearchParams } from '../../repositories/interfaces/base-repository.interface';

/**
 * Interfaz que define el contrato base para los servicios CRUD.
 * @template T Tipo de la entidad gestionada.
 */
export interface IBaseService<T> {
  /** Obtiene todos los registros. */
  getAll(): Observable<T[]>;
  /** Obtiene todos los registros aplicando filtros. */
  getAll(filters?: SearchParams): Observable<T[]>;
  /** Obtiene un registro por su ID. */
  getById(id: string): Observable<T | null>;
  /** Crea un nuevo registro. */
  add(entity: T): Observable<T>;
  /** Actualiza un registro existente. */
  update(id: string, entity: T): Observable<T>;
  /** Elimina un registro por su ID. */
  delete(id: string): Observable<T>;
}
