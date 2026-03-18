import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CartItemService } from '../../core/services/impl/cart-item.service';
import { MediaService } from '../../core/services/impl/media.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Media } from '../../core/models/media.model';

/**
 * Componente de la página del Carrito de Compras.
 * Permite gestionar los artículos seleccionados, ajustar cantidades,
 * eliminar productos y proceder al pago (checkout).
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  /** Lista de artículos en el carrito del usuario. */
  cartItems = signal<CartItem[]>([]);
  /** Indica si los datos están en proceso de carga. */
  loading = signal(true);
  /** Almacena mensajes de error en caso de fallo en las peticiones. */
  error = signal<string | null>(null);
  /** Estado de autenticación del usuario actual. */
  isAuthenticated = signal(false);

  constructor(
    private cartItemService: CartItemService,
    private mediaService: MediaService,
    private authService: BaseAuthenticationService,
    private router: Router,
  ) {}

  /**
   * Inicializa el componente verificando la sesión del usuario.
   * Si está autenticado, procede a cargar el contenido del carrito.
   */
  ngOnInit() {
    this.authService.authenticated$.subscribe((isAuth) => {
      this.isAuthenticated.set(isAuth);
      if (isAuth) {
        this.loadCart();
      } else {
        this.loading.set(false);
      }
    });
  }

  /**
   * Obtiene todos los artículos del carrito desde el servicio
   * y enriquece cada elemento con su información multimedia (imágenes).
   */
  loadCart() {
    this.loading.set(true);
    this.error.set(null);

    this.cartItemService.getAll().subscribe({
      next: (cartItems: CartItem[]) => {
        this.mediaService.getAll({}).subscribe({
          next: (allMedia: Media[]) => {
            cartItems.forEach((item) => {
              if (item.game) {
                item.game.media = allMedia.filter(
                  (m) => m.gameId == item.gameId,
                );
              }
            });
            this.cartItems.set(cartItems);
            this.loading.set(false);
          },
          error: () => {
            this.cartItems.set(cartItems);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Failed to load cart');
        this.loading.set(false);
      },
    });
  }

  /**
   * Incrementa en una unidad la cantidad de un artículo específico.
   * @param item El artículo a incrementar.
   */
  async incrementQuantity(item: CartItem) {
    if (!item.gameId || !item.platformId) return;
    try {
      await this.cartItemService
        .updateWithPlatform(item.gameId, item.platformId, item.quantity + 1)
        .toPromise();
      this.cartItems.update((items) =>
        items.map((i) =>
          i.gameId === item.gameId && i.platformId === item.platformId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      );
    } catch (error) {}
  }

  /**
   * Decrementa en una unidad la cantidad de un artículo.
   * Si la cantidad llega a cero, el artículo se elimina del carrito.
   * @param item El artículo a decrementar.
   */
  async decrementQuantity(item: CartItem) {
    if (!item.gameId || !item.platformId) return;
    if (item.quantity > 1) {
      try {
        await this.cartItemService
          .updateWithPlatform(item.gameId, item.platformId, item.quantity - 1)
          .toPromise();
        this.cartItems.update((items) =>
          items.map((i) =>
            i.gameId === item.gameId && i.platformId === item.platformId
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          ),
        );
      } catch (error) {}
    } else {
      await this.removeFromCart(item);
    }
  }

  /**
   * Elimina permanentemente un artículo del carrito.
   * @param item El artículo a eliminar.
   */
  async removeFromCart(item: CartItem) {
    if (!item.gameId || !item.platformId) return;
    try {
      await this.cartItemService
        .deleteWithPlatform(item.gameId, item.platformId)
        .toPromise();
      this.cartItems.update((items) =>
        items.filter(
          (i) =>
            !(i.gameId === item.gameId && i.platformId === item.platformId),
        ),
      );
    } catch (error) {}
  }

  /**
   * Vacía completamente el carrito de compras del usuario.
   */
  async clearCart() {
    const items = this.cartItems();
    for (const item of items) {
      if (item.gameId && item.platformId) {
        await this.cartItemService
          .deleteWithPlatform(item.gameId, item.platformId)
          .toPromise();
      }
    }
    this.cartItems.set([]);
  }

  /**
   * Calcula el coste total de un artículo multiplicando precio por cantidad.
   * @param item El artículo a calcular.
   */
  getItemTotal(item: CartItem): number {
    const price =
      item.game?.isOnSale && item.game?.salePrice !== null
        ? (item.game.salePrice ?? 0)
        : (item.game?.price ?? 0);
    return price * item.quantity;
  }

  /**
   * Calcula la suma total acumulada de todos los productos en el carrito.
   */
  getTotal(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + this.getItemTotal(item),
      0,
    );
  }

  /** Obtiene la imagen de portada de un artículo del carrito. */
  getGameImage(item: CartItem): string {
    return item.game?.media?.[0]?.url || 'assets/images/placeholder.png';
  }

  /** Obtiene el nombre del desarrollador o editor del videojuego. */
  getGameDeveloper(item: CartItem): string {
    return (
      item.game?.Developer?.name || item.game?.Publisher?.name || 'Unknown'
    );
  }

  /** Inicia el proceso de finalización de compra. */
  checkout() {}

  /** Navega a la pantalla de inicio de sesión. */
  goToLogin() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  /** Genera una secuencia para representar el conteo de artículos (uso en UI). */
  get cartItemsCount(): number[] {
    const count = this.cartItemService.cartCount$.value;
    return Array(count > 0 ? count : 1)
      .fill(0)
      .map((x, i) => i + 1);
  }
}
