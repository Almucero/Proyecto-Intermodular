import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../core/services/impl/favorite.service';
import { CartItemService } from '../../core/services/impl/cart-item.service';
import { MediaService } from '../../core/services/impl/media.service';
import { Favorite } from '../../core/models/favorite.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Media } from '../../core/models/media.model';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.scss',
})
export class FavouritesComponent implements OnInit {
  favorites = signal<Favorite[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private favoriteService: FavoriteService,
    private cartItemService: CartItemService,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading.set(true);
    this.error.set(null);

    this.favoriteService.getAll().subscribe({
      next: (favorites: Favorite[]) => {
        this.mediaService.getAll({}).subscribe({
          next: (allMedia: Media[]) => {
            favorites.forEach((fav) => {
              if (fav.game) {
                fav.game.media = allMedia.filter((m) => m.gameId == fav.gameId);
              }
            });
            this.favorites.set(favorites);
            this.loading.set(false);
          },
          error: () => {
            this.favorites.set(favorites);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Failed to load favorites');
        this.loading.set(false);
      },
    });
  }

  async addToCart(gameId: number) {
    if (!gameId) return;
    try {
      await this.cartItemService
        .add({ gameId, quantity: 1 } as unknown as CartItem)
        .toPromise();
    } catch (error) {}
  }

  async removeFromFavorites(gameId: number) {
    if (!gameId) return;
    try {
      await this.favoriteService.delete(String(gameId)).toPromise();
      this.favorites.update((favs) => favs.filter((f) => f.gameId !== gameId));
    } catch (error) {}
  }

  async transferAllToCart() {
    for (const favorite of this.favorites()) {
      if (favorite.gameId) {
        await this.addToCart(favorite.gameId);
      }
    }
  }

  getGameImage(fav: Favorite): string {
    return fav.game?.media?.[0]?.url || 'assets/images/placeholder.png';
  }

  getGameDeveloper(fav: Favorite): string {
    return fav.game?.Developer?.name || fav.game?.Publisher?.name || 'Unknown';
  }

  getGamePlatform(fav: Favorite): string {
    try {
      if (fav.gameId) {
        const saved = localStorage.getItem('favorites_platforms');
        if (saved) {
          const platforms = JSON.parse(saved);
          if (platforms[fav.gameId]) {
            return platforms[fav.gameId];
          }
        }
      }
    } catch (e) {}

    return fav.game?.platforms?.map((p) => p.name).join(' | ') || '';
  }
}
