import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import {
  CART_ITEM_REPOSITORY_TOKEN,
  API_URL_TOKEN,
  CART_ITEM_RESOURCE_NAME_TOKEN,
} from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { CartItem } from '../../models/cart-item.model';
import { BaseService } from './base-service.service';
import { BaseAuthenticationService } from './base-authentication.service';
import { ICartItemService } from '../interfaces/cart-item-service.interface';

@Injectable({
  providedIn: 'root',
})
export class CartItemService
  extends BaseService<CartItem>
  implements ICartItemService
{
  private isBrowser: boolean;
  public cartCount$ = new BehaviorSubject<number>(this.getInitialCount());

  constructor(
    @Inject(CART_ITEM_REPOSITORY_TOKEN) repository: IBaseRepository<CartItem>,
    private http: HttpClient,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    @Inject(CART_ITEM_RESOURCE_NAME_TOKEN) private resource: string,
    private auth: BaseAuthenticationService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    super(repository);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.auth.authenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.refreshCount();
      } else {
        this.cartCount$.next(0);
        if (this.isBrowser) {
          localStorage.setItem('cartCount', '0');
        }
      }
    });
  }

  private getInitialCount(): number {
    if (typeof localStorage === 'undefined') {
      return 0;
    }
    return parseInt(localStorage.getItem('cartCount') || '0', 10);
  }

  private updateLocalState(count: number) {
    this.cartCount$.next(count);
    if (this.isBrowser) {
      localStorage.setItem('cartCount', count.toString());
    }
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

  override add(entity: CartItem): Observable<CartItem> {
    return this.http
      .post<CartItem>(
        `${this.apiUrl}/${this.resource}`,
        {
          gameId: entity.gameId,
          platformId: entity.platformId,
          quantity: entity.quantity,
        },
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap(() => {
          this.updateLocalState(this.cartCount$.value + 1);
          this.refreshCount();
        }),
      );
  }

  deleteWithPlatform(gameId: number, platformId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${this.apiUrl}/${this.resource}/${gameId}?platformId=${platformId}`,
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap(() => {
          this.updateLocalState(Math.max(0, this.cartCount$.value - 1));
          this.refreshCount();
        }),
      );
  }

  updateWithPlatform(
    gameId: number,
    platformId: number,
    quantity: number,
  ): Observable<CartItem> {
    return this.http
      .patch<CartItem>(
        `${this.apiUrl}/${this.resource}/${gameId}`,
        { platformId, quantity },
        { headers: this.getAuthHeaders() },
      )
      .pipe(tap(() => this.refreshCount()));
  }

  override delete(id: string): Observable<CartItem> {
    return super.delete(id).pipe(
      tap(() => {
        this.updateLocalState(Math.max(0, this.cartCount$.value - 1));
        this.refreshCount();
      }),
    );
  }
}
