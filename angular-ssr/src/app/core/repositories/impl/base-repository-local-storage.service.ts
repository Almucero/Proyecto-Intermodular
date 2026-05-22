/**
 * @file: src/app/core/repositories/impl/base-repository-local-storage.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Implementación base de repositorio que usa LocalStorage (no implementada).
 */

import { Injectable, Inject } from '@angular/core';
import {
  IBaseRepository,
  SearchParams,
} from '../interfaces/base-repository.interface';
import { Model } from '../../models/base.model';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import {
  RESOURCE_NAME_TOKEN,
  REPOSITORY_MAPPING_TOKEN,
} from '../repository.tokens';
import { Observable } from 'rxjs';

/**
 * Implementación de repositorio que utiliza LocalStorage (actualmente no implementada).
 * Pensada para persistencia local en el navegador.
 */
@Injectable({
  providedIn: 'root',
})
export class BaseRepositoryLocalStorageService<
  T extends Model,
> implements IBaseRepository<T> {
   /**
    * Inicializa una nueva instancia de la clase de repositorio LocalStorage.
    * @param resource Nombre del recurso asociado (ej: 'games', 'users').
    * @param mapping Mapeador de datos para la serialización y deserialización de las entidades.
    */
  constructor(
    @Inject(RESOURCE_NAME_TOKEN) protected resource: string,
    @Inject(REPOSITORY_MAPPING_TOKEN) protected mapping: IBaseMapping<T>,
  ) { }

  /**
   * Obtiene todos los registros persistidos que cumplan con los filtros indicados.
   * @param filters Criterios de búsqueda y filtrado de la consulta.
   * @returns Un Observable que emite la colección de entidades T encontradas.
   */
  getAll(filters: SearchParams): Observable<T[]> {
    throw new Error('Metodo no implementado.');
  }
  /**
   * Recupera una entidad específica por su identificador único.
   * @param id Identificador único de la entidad.
   * @returns Un Observable que emite la entidad encontrada o null si no existe.
   */
  getById(id: string): Observable<T | null> {
    throw new Error('Metodo no implementado.');
  }
  /**
   * Añade una nueva entidad al repositorio persistente de local storage.
   * @param entity La entidad a ser guardada.
   * @returns Un Observable que emite la entidad añadida y confirmada.
   */
  add(entity: T): Observable<T> {
    throw new Error('Metodo no implementado.');
  }
  /**
   * Actualiza los datos de una entidad existente identificada por su ID.
   * @param id Identificador único de la entidad a actualizar.
   * @param entity Objeto que contiene los datos modificados.
   * @returns Un Observable que emite la entidad actualizada.
   */
  update(id: string, entity: T): Observable<T> {
    throw new Error('Metodo no implementado.');
  }
  /**
   * Elimina una entidad del almacenamiento local identificada por su ID.
   * @param id Identificador único de la entidad a borrar.
   * @returns Un Observable que emite la entidad que ha sido removida.
   */
  delete(id: string): Observable<T> {
    throw new Error('Metodo no implementado.');
  }
}
