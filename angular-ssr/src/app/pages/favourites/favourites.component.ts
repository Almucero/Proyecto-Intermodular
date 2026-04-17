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
import { LocalizedCurrencyPipe } from '../../shared/pipes/localized-currency.pipe';

/**
 * Componente de la página de Favoritos.
 * Muestra la lista de juegos que el usuario ha marcado como favoritos,
 * permitiendo moverlos al carrito o eliminarlos.
 */
@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, LocalizedCurrencyPipe],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.scss',
})
export class FavouritesComponent implements OnInit {
  /** Lista de favoritos cargada. */
  favorites = signal<Favorite[]>([]);
  /** Indica si se están cargando los datos. */
  loading = signal(true);
  /** Almacena mensajes de error si falla la carga. */
  error = signal<string | null>(null);
  /** Estado de autenticación del usuario. */
  isAuthenticated = signal(false);

  constructor(
    private favoriteService: FavoriteService,
    private cartItemService: CartItemService,
    private mediaService: MediaService,
    private authService: BaseAuthenticationService,
    private router: Router,
  ) {}

  /**
   * Inicializa el componente verificando la autenticación
   * y cargando la lista si el usuario está conectado.
   */
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

  /**
   * Obtiene todos los favoritos del usuario y carga sus imágenes asociadas.
   */
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

  /**
   * Añade un juego favorito al carrito y lo elimina de la lista de favoritos.
   * @param fav El objeto del favorito a procesar.
   */
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

  /**
   * Elimina un juego de la lista de favoritos.
   * @param fav El objeto del favorito a eliminar.
   */
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

  /**
   * Mueve todos los juegos favoritos al carrito a la vez.
   */
  async transferAllToCart() {
    for (const favorite of this.favorites()) {
      if (favorite.gameId && favorite.platformId) {
        await this.addToCart(favorite);
      }
    }
  }

  /** Obtiene la imagen representativa de un juego favorito. */
  getGameImage(fav: Favorite): string {
    return fav.game?.media?.[0]?.url || 'assets/images/ui/placeholder.webp';
  }

  /** Obtiene el nombre del desarrollador o editor del juego. */
  getGameDeveloper(fav: Favorite): string {
    return fav.game?.Developer?.name || fav.game?.Publisher?.name || 'Unknown';
  }

  /** Redirige a la página de inicio de sesión. */
  goToLogin() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  /** Genera un array basado en el número total de favoritos (para iteraciones en UI). */
  get favoritesCount(): number[] {
    const count = Math.max(this.favoriteService.favoritesCount$.value ?? 0, 0);
    return Array(count)
      .fill(0)
      .map((x, i) => i + 1);
  }
}
