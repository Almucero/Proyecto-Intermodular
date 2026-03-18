import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IBaseService } from '../interfaces/base-service.interface';
import {
  IBaseRepository,
  SearchParams,
} from '../../repositories/interfaces/base-repository.interface';
import { Model } from '../../models/base.model';
import { REPOSITORY_TOKEN } from '../../repositories/repository.tokens';

/**
 * Servicio base genérico que proporciona operaciones CRUD estándar.
 * @template T Tipo del modelo que extiende de {@link Model}.
 */
@Injectable({
  providedIn: 'root',
})
export class BaseService<T extends Model> implements IBaseService<T> {
  /**
   * @param repository Repositorio inyectado que maneja la persistencia de los datos.
   */
  constructor(
    @Inject(REPOSITORY_TOKEN) protected repository: IBaseRepository<T>,
  ) {}

  /**
   * Obtiene todos los registros, opcionalmente filtrados.
   * @param filters Parámetros de búsqueda y filtrado.
   * @returns Un Observable con el array de entidades encontradas.
   */
  getAll(filters?: SearchParams): Observable<T[]> {
    return this.repository.getAll(filters ?? {});
  }

  /**
   * Obtiene un registro por su identificador único.
   * @param id Identificador del registro.
   * @returns Un Observable con la entidad o null si no se encuentra.
   */
  getById(id: string): Observable<T | null> {
    return this.repository.getById(id);
  }

  /**
   * Añade un nuevo registro al sistema.
   * @param entity La entidad a crear.
   * @returns Un Observable con la entidad creada.
   */
  add(entity: T): Observable<T> {
    return this.repository.add(entity);
  }

  /**
   * Actualiza un registro existente.
   * @param id Identificador del registro a actualizar.
   * @param entity Datos actualizados de la entidad.
   * @returns Un Observable con la entidad actualizada.
   */
  update(id: string, entity: T): Observable<T> {
    return this.repository.update(id, entity);
  }

  /**
   * Elimina un registro del sistema.
   * @param id Identificador del registro a eliminar.
   * @returns Un Observable con la entidad eliminada.
   */
  delete(id: string): Observable<T> {
    return this.repository.delete(id);
  }
}
