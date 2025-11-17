import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseRepository } from '../interfaces/base-repository.interface';
import { PEOPLE_API_URL } from '../repository.tokens';

@Injectable({
  providedIn: 'root',
})
export class BaseRepositoryHttpService<T> implements IBaseRepository<T> {
  protected apiUrl: string = '';
  constructor(
    protected http: HttpClient,
    @Inject(PEOPLE_API_URL) apiUrl: string // URL base de la API para el modelo
  ) {
    this.apiUrl = apiUrl;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}`);
  }

  getById(id: string): Observable<T | null> {
    return this.http.get<T>(`${this.apiUrl}/${id}`);
  }

  add(entity: T): Observable<string> {
    return new Observable<string>((observer) => {
      this.http.post<T>(`${this.apiUrl}`, entity).subscribe({
        next: (response: any) => {
          observer.next(response.id); // Asume que la API retorna el ID del nuevo recurso
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  update(id: string, entity: T): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
