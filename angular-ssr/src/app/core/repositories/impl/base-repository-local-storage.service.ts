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
       * Documentado.
       * @param resource Nombre del recurso.
       *
       * @param mapping Mapeador de datos.
       */
  constructor(
    @Inject(RESOURCE_NAME_TOKEN) protected resource: string,
    @Inject(REPOSITORY_MAPPING_TOKEN) protected mapping: IBaseMapping<T>,
  ) {}

  /**
     * Método no documentado.
     * @param filters Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getAll(filters: SearchParams): Observable<T[]> {
    throw new Error('Metodo no implementado.');
  }
  /**
     * Método no documentado.
     * @param id Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getById(id: string): Observable<T | null> {
    throw new Error('Metodo no implementado.');
  }
  /**
     * Método no documentado.
     * @param entity Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    add(entity: T): Observable<T> {
    throw new Error('Metodo no implementado.');
  }
  /**
     * Método no documentado.
     * @param id Parámetro no documentado.
     * @param entity Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    update(id: string, entity: T): Observable<T> {
    throw new Error('Metodo no implementado.');
  }
  /**
     * Método no documentado.
     * @param id Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    delete(id: string): Observable<T> {
    throw new Error('Metodo no implementado.');
  }
}
