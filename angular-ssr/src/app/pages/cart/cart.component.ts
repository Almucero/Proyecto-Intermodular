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

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cartItems = signal<CartItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  isAuthenticated = signal(false);

  constructor(
    private cartItemService: CartItemService,
    private mediaService: MediaService,
    private authService: BaseAuthenticationService,
    private router: Router,
  ) {}

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

  getItemTotal(item: CartItem): number {
    const price =
      item.game?.isOnSale && item.game?.salePrice !== null
        ? (item.game.salePrice ?? 0)
        : (item.game?.price ?? 0);
    return price * item.quantity;
  }

  getTotal(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + this.getItemTotal(item),
      0,
    );
  }

  getGameImage(item: CartItem): string {
    return item.game?.media?.[0]?.url || 'assets/images/placeholder.png';
  }

  getGameDeveloper(item: CartItem): string {
    return (
      item.game?.Developer?.name || item.game?.Publisher?.name || 'Unknown'
    );
  }

  checkout() {}

  goToLogin() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  get cartItemsCount(): number[] {
    const count = this.cartItemService.cartCount$.value;
    return Array(count > 0 ? count : 1)
      .fill(0)
      .map((x, i) => i + 1);
  }
}
