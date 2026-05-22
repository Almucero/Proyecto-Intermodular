/**
 * @file: src/app/core/repositories/impl/base-repository-http.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio de repositorio HTTP genérico para operaciones CRUD.
 */

import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  IBaseRepository,
  SearchParams,
} from '../interfaces/base-repository.interface';
import {
  API_URL_TOKEN,
  AUTH_TOKEN,
  REPOSITORY_MAPPING_TOKEN,
  RESOURCE_NAME_TOKEN,
} from '../repository.tokens';
import { Model } from '../../models/base.model';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { IAuthentication } from '../../services/interfaces/authentication.interface';

/**
 * Implementación base de un repositorio utilizando el cliente HTTP de Angular.
 * Proporciona el comportamiento estándar para las operaciones CRUD contra una API REST.
 * @template T Tipo de modelo que extiende de {@link Model}.
 */
@Injectable({
  providedIn: 'root',
})
export class BaseRepositoryHttpService<
  T extends Model,
> implements IBaseRepository<T> {
  /**
   * Inicializa el servicio de repositorio HTTP genérico.
   * @param http Cliente HTTP de Angular para realizar llamadas REST.
   * @param auth Servicio de autenticación para la inyección y lectura de JWT.
   * @param apiUrl URL base del backend/API.
   * @param resource Nombre del endpoint del recurso.
   * @param mapping Mapeador de datos para adaptar respuestas y modelos.
   */
  constructor(
    protected http: HttpClient,
    @Inject(AUTH_TOKEN) protected auth: IAuthentication,
    @Inject(API_URL_TOKEN) protected apiUrl: string,
    @Inject(RESOURCE_NAME_TOKEN) protected resource: string,
    @Inject(REPOSITORY_MAPPING_TOKEN) protected mapping: IBaseMapping<T>,
  ) {
    this.apiUrl = apiUrl;
  }

  /**
   * Genera las cabeceras de autorización con el token JWT si está disponible.
   * @returns Objeto con la cabecera 'Authorization'.
   */
  protected getHeaders(): { [header: string]: string | string[] } {
    const token = this.auth.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Obtiene todos los recursos aplicando filtros opcionales.
   * @param filters Parámetros de consulta (query params).
   * @returns Observable que emite la lista mapeada de entidades T.
   */
  getAll(filters: SearchParams): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.apiUrl}/${this.resource}`, {
        params: filters as any,
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getAll(res)));
  }

  /**
   * Obtiene un recurso específico por su ID.
   * @param id Identificador único.
   * @returns Observable con el recurso mapeado o null si no se encuentra.
   */
  getById(id: string): Observable<T | null> {
    return this.http
      .get<T>(`${this.apiUrl}/${this.resource}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getOne(res)));
  }

  /**
   * Crea un nuevo recurso.
   * @param entity Datos del nuevo recurso.
   * @returns Observable con el recurso creado y mapeado.
   */
  add(entity: T): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}/${this.resource}`, entity, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getAdded(res)));
  }

  /**
   * Actualiza parcialmente un recurso existente (usando PATCH).
   * @param id ID del recurso.
   * @param entity Datos a actualizar.
   * @returns Observable con el recurso modificado y mapeado.
   */
  update(id: string, entity: T): Observable<T> {
    return this.http
      .patch<T>(`${this.apiUrl}/${this.resource}/${id}`, entity, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getUpdated(res)));
  }

  /**
   * Elimina un recurso.
   * @param id ID del recurso a borrar.
   * @returns Observable con el recurso eliminado y mapeado.
   */
  delete(id: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}/${this.resource}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getDeleted(res)));
  }
}
