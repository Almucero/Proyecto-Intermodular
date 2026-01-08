import { Inject, Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class FavoriteService
  extends BaseService<Favorite>
  implements IFavoriteService
{
  public favoritesCount$ = new BehaviorSubject<number>(
    parseInt(localStorage.getItem('favoritesCount') || '0', 10)
  );

  constructor(
    @Inject(FAVORITE_REPOSITORY_TOKEN) repository: IBaseRepository<Favorite>,
    private http: HttpClient,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    @Inject(FAVORITE_RESOURCE_NAME_TOKEN) private resource: string,
    private auth: BaseAuthenticationService
  ) {
    super(repository);
    this.auth.authenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.refreshCount();
      } else {
        this.favoritesCount$.next(0);
        localStorage.setItem('favoritesCount', '0');
      }
    });
  }

  private updateLocalState(count: number) {
    this.favoritesCount$.next(count);
    localStorage.setItem('favoritesCount', count.toString());
  }

  refreshCount() {
    this.getAll().subscribe({
      next: (items) => this.updateLocalState(items.length),
      error: () => this.updateLocalState(0),
    });
  }

  private getAuthHeaders(): any {
    const headers: any = {};
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  override add(entity: Favorite): Observable<Favorite> {
    return this.http
      .post<Favorite>(
        `${this.apiUrl}/${this.resource}`,
        { gameId: entity.gameId, platformId: entity.platformId },
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap(() => {
          this.updateLocalState(this.favoritesCount$.value + 1);
          this.refreshCount();
        })
      );
  }

  deleteWithPlatform(gameId: number, platformId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${this.apiUrl}/${this.resource}/${gameId}?platformId=${platformId}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap(() => {
          this.updateLocalState(Math.max(0, this.favoritesCount$.value - 1));
          this.refreshCount();
        })
      );
  }

  override delete(id: string): Observable<Favorite> {
    return super.delete(id).pipe(
      tap(() => {
        this.updateLocalState(Math.max(0, this.favoritesCount$.value - 1));
        this.refreshCount();
      })
    );
  }
}
