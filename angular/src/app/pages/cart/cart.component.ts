import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CartItemService } from '../../core/services/impl/cart-item.service';

interface CartGame {
  id: number;
  title: string;
  price: number;
  rating?: number;
  cartItemId: number;
  quantity: number;
  addedAt: string;
  media?: any[];
  developer?: { name: string };
  publisher?: { name: string };
  platforms?: { name: string }[];
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cartItems = signal<CartGame[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private cartItemService: CartItemService) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading.set(true);
    this.error.set(null);

    this.cartItemService.getAll().subscribe({
      next: (data: any) => {
        this.cartItems.set(data as CartGame[]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error.set('Failed to load cart');
        this.loading.set(false);
      },
    });
  }

  async incrementQuantity(item: CartGame) {
    try {
      await this.cartItemService
        .update(String(item.id), {
          ...item,
          quantity: item.quantity + 1,
        } as any)
        .toPromise();
      // Update local state
      this.cartItems.update((items) =>
        items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  async decrementQuantity(item: CartGame) {
    if (item.quantity > 1) {
      try {
        await this.cartItemService
          .update(String(item.id), {
            ...item,
            quantity: item.quantity - 1,
          } as any)
          .toPromise();
        // Update local state
        this.cartItems.update((items) =>
          items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
          )
        );
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      // If quantity is 1, remove from cart
      await this.removeFromCart(item.id);
    }
  }

  async removeFromCart(gameId: number) {
    try {
      await this.cartItemService.delete(String(gameId)).toPromise();
      // Remove from local state
      this.cartItems.update((items) => items.filter((i) => i.id !== gameId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  getItemTotal(item: CartGame): number {
    return item.price * item.quantity;
  }

  getGameImage(game: CartGame): string {
    return game.media?.[0]?.url || 'assets/placeholder-game.png';
  }

  getGameDeveloper(game: CartGame): string {
    return game.developer?.name || game.publisher?.name || 'Unknown';
  }

  getGamePlatform(game: CartGame): string {
    return game.platforms?.[0]?.name || 'Multi-platform';
  }

  checkout() {
    // TODO: Implement checkout logic
    console.log('Checkout clicked');
  }
}
