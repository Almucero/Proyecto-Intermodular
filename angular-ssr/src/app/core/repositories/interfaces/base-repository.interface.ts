import { Observable } from 'rxjs';
import { Model } from '../../models/base.model';
/**
 * Parámetros para búsqueda y filtrado de datos.
 */
export interface SearchParams {
  [key: string]: string;
}

/**
 * Interfaz base de repositorio que proporciona operaciones CRUD estándar.
 * @template T El tipo de modelo que extiende de {@link Model}.
 */
export interface IBaseRepository<T extends Model> {
  /** Obtiene todos los registros que coincidan con los filtros. */
  getAll(filters: SearchParams): Observable<T[]>;
  /** Obtiene un registro por su identificador único. */
  getById(id: string): Observable<T | null>;
  /** Añade un nuevo recurso. */
  add(entity: T): Observable<T>;
  /** Actualiza un recurso existente. */
  update(id: string, entity: T): Observable<T>;
  /** Elimina un recurso por su ID. */
  delete(id: string): Observable<T>;
}
