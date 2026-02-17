import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FavoriteService } from '../../core/services/impl/favorite.service';
import { CartItemService } from '../../core/services/impl/cart-item.service';
import { MediaService } from '../../core/services/impl/media.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { Favorite } from '../../core/models/favorite.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Media } from '../../core/models/media.model';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.scss',
})
export class FavouritesComponent implements OnInit {
  favorites = signal<Favorite[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  isAuthenticated = signal(false);

  constructor(
    private favoriteService: FavoriteService,
    private cartItemService: CartItemService,
    private mediaService: MediaService,
    private authService: BaseAuthenticationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.authenticated$.subscribe((isAuth) => {
      this.isAuthenticated.set(isAuth);
      if (isAuth) {
        this.loadFavorites();
      } else {
        this.loading.set(false);
      }
    });
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

  async addToCart(fav: Favorite) {
    if (!fav.gameId || !fav.platformId) return;
    try {
      await this.cartItemService
        .add({
          gameId: fav.gameId,
          platformId: fav.platformId,
          quantity: 1,
        } as CartItem)
        .toPromise();
      await this.removeFromFavorites(fav);
    } catch (error) {}
  }

  async removeFromFavorites(fav: Favorite) {
    if (!fav.gameId || !fav.platformId) return;
    try {
      await this.favoriteService
        .deleteWithPlatform(fav.gameId, fav.platformId)
        .toPromise();
      this.favorites.update((favs) =>
        favs.filter(
          (f) => !(f.gameId === fav.gameId && f.platformId === fav.platformId),
        ),
      );
    } catch (error) {}
  }

  async transferAllToCart() {
    for (const favorite of this.favorites()) {
      if (favorite.gameId && favorite.platformId) {
        await this.addToCart(favorite);
      }
    }
  }

  getGameImage(fav: Favorite): string {
    return fav.game?.media?.[0]?.url || 'assets/images/placeholder.png';
  }

  getGameDeveloper(fav: Favorite): string {
    return fav.game?.Developer?.name || fav.game?.Publisher?.name || 'Unknown';
  }

  goToLogin() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  get favoritesCount(): number[] {
    const count = this.favoriteService.favoritesCount$.value;
    return Array(count > 0 ? count : 1)
      .fill(0)
      .map((x, i) => i + 1);
  }
}
