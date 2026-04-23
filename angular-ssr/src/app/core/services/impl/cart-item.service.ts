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

export interface CheckoutSessionResponse {
  clientSecret: string;
  sessionId: string;
  publishableKey: string;
}

export interface DirectCheckoutSessionPayload {
  gameId: number;
  platformId: number;
  locale?: string;
}

/**
 * Servicio para la gestión de los artículos del carrito de compras.
 * Maneja la persistencia en el servidor y sincroniza el estado local (localStorage y BehaviorSubject).
 */
@Injectable({
  providedIn: 'root',
})
export class CartItemService
  extends BaseService<CartItem>
  implements ICartItemService
{
  private isBrowser: boolean;
  /** Observable con el número actual de artículos en el carrito. */
  public cartCount$ = new BehaviorSubject<number>(this.getInitialCount());

  /**
   * @param repository Repositorio de base para artículos del carrito.
   * @param http Cliente HTTP para peticiones personalizadas.
   * @param apiUrl URL base de la API.
   * @param resource Nombre del recurso en la API.
   * @param auth Servicio de autenticación para obtener el token.
   * @param platformId ID de la plataforma (Browser/Server).
   */
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

  /**
   * Obtiene la cuenta inicial del carrito desde localStorage.
   * @returns El número de artículos guardado o 0.
   */
  private getInitialCount(): number {
    if (typeof localStorage === 'undefined') {
      return 0;
    }
    return parseInt(localStorage.getItem('cartCount') || '0', 10);
  }

  /**
   * Actualiza el estado local y el almacenamiento persistente del navegador.
   * @param count Nueva cuenta de artículos.
   */
  private updateLocalState(count: number) {
    this.cartCount$.next(count);
    if (this.isBrowser) {
      localStorage.setItem('cartCount', count.toString());
    }
  }

  /**
   * Sincroniza la cuenta del carrito con los datos reales del servidor.
   */
  refreshCount() {
    this.getAll().subscribe({
      next: (items) => this.updateLocalState(items.length),
      error: () => this.updateLocalState(0),
    });
  }

  /**
   * Genera las cabeceras de autorización con el token JWT.
   * @returns Cabeceras HTTP con Authorization Bearer.
   */
  private getAuthHeaders(): any {
    const headers: any = {};
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Añade un artículo al carrito en el servidor y actualiza el estado local.
   * @param entity Artículo a añadir.
   * @returns Observable con el artículo creado.
   */
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

  /**
   * Elimina un artículo del carrito filtrando por juego y plataforma.
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
          this.updateLocalState(Math.max(0, this.cartCount$.value - 1));
          this.refreshCount();
        }),
      );
  }

  /**
   * Actualiza la cantidad de un artículo existente en el carrito.
   * @param gameId ID del juego.
   * @param platformId ID de la plataforma.
   * @param quantity Nueva cantidad deseada.
   * @returns Observable con el artículo actualizado.
   */
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

  createCheckoutSession(locale?: string): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/${this.resource}/checkout-session`,
      locale ? { locale } : {},
      { headers: this.getAuthHeaders() },
    );
  }

  createDirectCheckoutSession(
    payload: DirectCheckoutSessionPayload,
  ): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/${this.resource}/direct-checkout-session`,
      payload,
      { headers: this.getAuthHeaders() },
    );
  }

  confirmCheckoutSession(sessionId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${this.resource}/checkout/confirm`,
      { sessionId },
      { headers: this.getAuthHeaders() },
    );
  }

  confirmDirectCheckoutSession(sessionId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${this.resource}/direct-checkout/confirm`,
      { sessionId },
      { headers: this.getAuthHeaders() },
    );
  }

  /**
   * Elimina un artículo por su ID interno de base de datos.
   * @param id Identificador único del registro CartItem.
   * @returns Observable con la entidad eliminada.
   */
  override delete(id: string): Observable<CartItem> {
    return super.delete(id).pipe(
      tap(() => {
        this.updateLocalState(Math.max(0, this.cartCount$.value - 1));
        this.refreshCount();
      }),
    );
  }
}
