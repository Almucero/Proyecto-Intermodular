import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import {
  FAVORITE_REPOSITORY_TOKEN,
  API_URL_TOKEN,
  FAVORITE_RESOURCE_NAME_TOKEN,
} from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Favorite } from '../../models/favorite.model';
import { BaseService } from './base-service.service';
import { BaseAuthenticationService } from './base-authentication.service';
import { IFavoriteService } from '../interfaces/favorite-service.interface';

/**
 * Servicio para la gestión de los juegos favoritos del usuario.
 * Sincroniza el estado de favoritos entre el servidor y la interfaz (BehaviorSubject y localStorage).
 */
@Injectable({
  providedIn: 'root',
})
export class FavoriteService
  extends BaseService<Favorite>
  implements IFavoriteService
{
  private isBrowser: boolean;
  /** Observable con el número total de favoritos del usuario actual. */
  public favoritesCount$ = new BehaviorSubject<number>(this.getInitialCount());

  /**
   * @param repository Repositorio base para favoritos.
   * @param http Cliente HTTP para operaciones personalizadas.
   * @param apiUrl URL base de la API.
   * @param resource Nombre del recurso de favoritos en la API.
   * @param auth Servicio de autenticación.
   * @param platformId ID de la plataforma de ejecución.
   */
  constructor(
    @Inject(FAVORITE_REPOSITORY_TOKEN) repository: IBaseRepository<Favorite>,
    private http: HttpClient,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    @Inject(FAVORITE_RESOURCE_NAME_TOKEN) private resource: string,
    private auth: BaseAuthenticationService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    super(repository);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.auth.authenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.refreshCount();
      } else {
        this.favoritesCount$.next(0);
        if (this.isBrowser) {
          localStorage.setItem('favoritesCount', '0');
        }
      }
    });
  }

  /**
   * Recupera la cuenta inicial de favoritos desde el almacenamiento persistente.
   */
  private getInitialCount(): number {
    if (typeof localStorage === 'undefined') {
      return 0;
    }
    return parseInt(localStorage.getItem('favoritesCount') || '0', 10);
  }

  /**
   * Actualiza el estado local y el almacenamiento del navegador.
   * @param count Nueva cantidad de favoritos.
   */
  private updateLocalState(count: number) {
    this.favoritesCount$.next(count);
    if (this.isBrowser) {
      localStorage.setItem('favoritesCount', count.toString());
    }
  }

  /**
   * Refresca la cuenta de favoritos consultando al servidor.
   */
  refreshCount() {
    this.getAll().subscribe({
      next: (items) => this.updateLocalState(items.length),
      error: () => this.updateLocalState(0),
    });
  }

  /**
   * Obtiene las cabeceras de autenticación necesarias.
   */
  private getAuthHeaders(): any {
    const headers: any = {};
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Añade un juego a la lista de favoritos.
   * @param entity Objeto favorito a crear.
   * @returns Observable con el favorito creado.
   */
  override add(entity: Favorite): Observable<Favorite> {
    return this.http
      .post<Favorite>(
        `${this.apiUrl}/${this.resource}`,
        { gameId: entity.gameId, platformId: entity.platformId },
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap(() => {
          this.updateLocalState(this.favoritesCount$.value + 1);
          this.refreshCount();
        }),
      );
  }

  /**
   * Elimina un favorito especificando juego y plataforma.
   * @param gameId ID del juego.
   * @param platformId ID de la plataforma.
   * @returns Observable con la respuesta de eliminación.
   */
  deleteWithPlatform(gameId: number, platformId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${this.apiUrl}/${this.resource}/${gameId}?platformId=${platformId}`,
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap(() => {
          this.updateLocalState(Math.max(0, this.favoritesCount$.value - 1));
          this.refreshCount();
        }),
      );
  }

  /**
   * Elimina un favorito por su ID.
   * @param id ID único del registro de favorito.
   * @returns Observable con la entidad eliminada.
   */
  override delete(id: string): Observable<Favorite> {
    return super.delete(id).pipe(
      tap(() => {
        this.updateLocalState(Math.max(0, this.favoritesCount$.value - 1));
        this.refreshCount();
      }),
    );
  }
}
