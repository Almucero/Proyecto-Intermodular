import { Inject, Injectable } from '@angular/core';
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
  public cartCount$ = new BehaviorSubject<number>(0);

  constructor(
    @Inject(CART_ITEM_REPOSITORY_TOKEN) repository: IBaseRepository<CartItem>,
    private http: HttpClient,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    @Inject(CART_ITEM_RESOURCE_NAME_TOKEN) private resource: string,
    private auth: BaseAuthenticationService
  ) {
    super(repository);
    this.auth.authenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.refreshCount();
      } else {
        this.cartCount$.next(0);
      }
    });
  }

  refreshCount() {
    this.getAll().subscribe({
      next: (items) => this.cartCount$.next(items.length),
      error: () => this.cartCount$.next(0),
    });
  }

  override add(entity: CartItem): Observable<CartItem> {
    const headers: any = {};
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http
      .post<CartItem>(
        `${this.apiUrl}/${this.resource}/${entity.gameId}`,
        { quantity: entity.quantity },
        { headers }
      )
      .pipe(tap(() => this.refreshCount()));
  }

  override delete(id: string): Observable<CartItem> {
    return super.delete(id).pipe(tap(() => this.refreshCount()));
  }
}
