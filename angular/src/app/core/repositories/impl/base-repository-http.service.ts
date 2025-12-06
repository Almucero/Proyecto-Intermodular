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

@Injectable({
  providedIn: 'root',
})
export class BaseRepositoryHttpService<T extends Model>
  implements IBaseRepository<T>
{
  constructor(
    protected http: HttpClient,
    @Inject(AUTH_TOKEN) protected auth: IAuthentication,
    @Inject(API_URL_TOKEN) protected apiUrl: string,
    @Inject(RESOURCE_NAME_TOKEN) protected resource: string,
    @Inject(REPOSITORY_MAPPING_TOKEN) protected mapping: IBaseMapping<T>
  ) {
    this.apiUrl = apiUrl;
  }

  protected getHeaders(): { [header: string]: string | string[] } {
    const token = this.auth.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  getAll(filters: SearchParams): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.apiUrl}/${this.resource}`, {
        params: filters as any,
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getAll(res)));
  }

  getById(id: string): Observable<T | null> {
    return this.http
      .get<T>(`${this.apiUrl}/${this.resource}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getOne(res)));
  }

  add(entity: T): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}/${this.resource}`, entity, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getAdded(res)));
  }

  update(id: string, entity: T): Observable<T> {
    return this.http
      .patch<T>(`${this.apiUrl}/${this.resource}/${id}`, entity, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getUpdated(res)));
  }

  delete(id: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}/${this.resource}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapping.getDeleted(res)));
  }
}
