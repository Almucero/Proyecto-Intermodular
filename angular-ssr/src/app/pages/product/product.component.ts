import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GameService } from '../../core/services/impl/game.service';
import { MediaService } from '../../core/services/impl/media.service';
import { CartItemService } from '../../core/services/impl/cart-item.service';
import { FavoriteService } from '../../core/services/impl/favorite.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Favorite } from '../../core/models/favorite.model';
import { Game } from '../../core/models/game.model';

interface MediaItem {
  type: 'video' | 'image';
  label: string;
  url?: string | SafeResourceUrl;
  thumbnail?: string;
}

/**
 * Componente de la página de detalle de un producto (juego).
 * Muestra información exhaustiva, galería de medios (vídeo/imágenes),
 * selección de plataformas y opciones de compra/favoritos.
 */
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  /** Objeto del juego cargado. */
  game: Game | null = this.createPlaceholder();
  /** Plataforma seleccionada actualmente por el usuario. */
  selectedPlatform: string | null = null;
  /** Índice del medio (vídeo/imagen) que se muestra en el visor principal. */
  currentMediaIndex: number = 0;
  /** Lista de elementos multimedia procesados para el visor. */
  mediaItems: MediaItem[] = [];

  /** Estados para notificaciones visuales y modales. */
  showAuthModal = signal(false);
  isAuthenticated = signal(false);
  addedToCartSuccess = signal(false);
  addedToFavoritesSuccess = signal(false);
  buySuccess = signal(false);
  quantityIncreased = signal(false);
  alreadyInCart = signal(false);
  alreadyInFavorites = signal(false);

  /** Configuración estática de todas las plataformas soportadas. */
  allPlatforms = [
    {
      name: 'PC',
      image: 'assets/images/platforms/pc.png',
      stockKey: 'stockPc' as const,
    },
    {
      name: 'PS5',
      image: 'assets/images/platforms/ps5.png',
      stockKey: 'stockPs5' as const,
    },
    {
      name: 'Xbox Series X',
      image: 'assets/images/platforms/xbox-series-x.png',
      stockKey: 'stockXboxX' as const,
    },
    {
      name: 'Switch',
      image: 'assets/images/platforms/switch.png',
      stockKey: 'stockSwitch' as const,
    },
    {
      name: 'PS4',
      image: 'assets/images/platforms/ps4.png',
      stockKey: 'stockPs4' as const,
    },
    {
      name: 'Xbox One',
      image: 'assets/images/platforms/xbox-one.png',
      stockKey: 'stockXboxOne' as const,
    },
  ];

  /** Devuelve las plataformas ordenadas, priorizando las que tienen stock. */
  get sortedPlatforms() {
    return [...this.allPlatforms].sort((a, b) => {
      const aAvailable = this.isPlatformAvailable(a.name);
      const bAvailable = this.isPlatformAvailable(b.name);
      if (aAvailable === bAvailable) return 0;
      return aAvailable ? -1 : 1;
    });
  }

  /** Obtiene la URL de la imagen de portada de la lista de medios. */
  get coverImage(): string | undefined {
    return this.game?.media?.find((m) =>
      m.altText?.toLowerCase().includes('cover'),
    )?.url;
  }

  /** Obtiene la URL de la primera captura de pantalla. */
  get screenshot1(): string | undefined {
    return this.game?.media?.find(
      (m) =>
        m.altText?.toLowerCase().includes('screenshot1') ||
        m.altText?.toLowerCase().includes('screenshot 1'),
    )?.url;
  }

  /** Obtiene la URL de la segunda captura de pantalla. */
  get screenshot2(): string | undefined {
    return this.game?.media?.find(
      (m) =>
        m.altText?.toLowerCase().includes('screenshot2') ||
        m.altText?.toLowerCase().includes('screenshot 2'),
    )?.url;
  }

  constructor(
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    private gameService: GameService,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer,
    private cartItemService: CartItemService,
    private favoriteService: FavoriteService,
    private authService: BaseAuthenticationService,
    @Inject(Router) private router: Router,
  ) {}

  /**
   * Inicializa el componente cargando el juego según el ID de la ruta.
   */
  ngOnInit(): void {
    this.game = this.createPlaceholder();
    this.buildMediaItems();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(id);
    }

    this.authService.authenticated$.subscribe((isAuth) => {
      this.isAuthenticated.set(isAuth);
    });
  }

  /** Crea un objeto juego vacío para el estado inicial de carga. */
  createPlaceholder(): Game {
    return {
      id: -1,
      title: 'common.loading',
      description: '...',
      price: 0,
      rating: 0,
      releaseDate: new Date(),
      stockPc: 0,
      stockPs5: 0,
      stockXboxX: 0,
      stockSwitch: 0,
      stockPs4: 0,
      stockXboxOne: 0,
      numberOfSales: 0,
      isOnSale: false,
      isRefundable: false,
      media: [],
      platforms: [],
    } as unknown as Game;
  }

  /**
   * Carga los datos del juego y sus medios asociados.
   * Selecciona automáticamente la plataforma si solo hay una disponible.
   * @param id ID del juego.
   */
  loadGame(id: string): void {
    this.gameService.getById(id).subscribe((game) => {
      if (game) {
        this.mediaService.getAll({}).subscribe((allMedia) => {
          game.media = allMedia.filter((m) => m.gameId === game.id);
          this.game = game;
          this.buildMediaItems();

          const availablePlatforms = this.allPlatforms.filter((platform) =>
            this.isPlatformAvailable(platform.name),
          );

          if (availablePlatforms.length === 1) {
            this.selectedPlatform = availablePlatforms[0].name;
          }
        });
      }
    });
  }

  /**
   * Construye la lista de medios para el visor (vídeo de YouTube + capturas).
   */
  buildMediaItems(): void {
    if (!this.game) return;

    this.mediaItems = [];

    if (this.game.id === -1) {
      this.mediaItems.push({
        type: 'image',
        label: 'Loading...',
        url: 'assets/images/placeholder.jpg',
      });
      return;
    }

    if (this.game.videoUrl) {
      const isImage = this.game.videoUrl.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)$/i) != null;

      if (isImage) {
        this.mediaItems.push({
          type: 'image',
          label: 'Video (Image)',
          url: this.game.videoUrl,
        });
      } else {
        const videoId = this.getVideoId(this.game.videoUrl);
        const embedUrl = this.convertToEmbedUrl(this.game.videoUrl);
        const thumbnailUrl = videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : undefined;

        this.mediaItems.push({
          type: 'video',
          label: 'Video',
          url: this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl),
          thumbnail: thumbnailUrl,
        });
      }
    }

    if (this.coverImage) {
      this.mediaItems.push({
        type: 'image',
        label: 'Cover',
        url: this.coverImage,
      });
    }
  }

  /** Obtiene la cantidad de stock para una plataforma específica. */
  getStockForPlatform(platformName: string | null): number {
    if (!this.game || !platformName) return 0;
    const platform = this.allPlatforms.find((p) => p.name === platformName);
    if (!platform) return 0;
    return (this.game as any)[platform.stockKey] || 0;
  }

  /** Obtiene el ID numérico de la plataforma seleccionada. */
  getSelectedPlatformId(): number | null {
    if (!this.selectedPlatform || !this.game?.platforms) return null;
    const platform = this.game.platforms.find(
      (p) => p.name === this.selectedPlatform,
    );
    return platform?.id || null;
  }

  /** Verifica si el usuario está autenticado, mostrando un modal si no lo está. */
  checkAuth(): boolean {
    if (!this.isAuthenticated()) {
      this.showAuthModal.set(true);
      return false;
    }
    return true;
  }

  /** Redirige al login tras confirmación en el modal. */
  confirmLogin() {
    this.showAuthModal.set(false);
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  /** Cierra el modal de autenticación. */
  cancelLogin() {
    this.showAuthModal.set(false);
  }

  /**
   * Añade el producto al carrito para la plataforma seleccionada.
   */
  addToCart() {
    if (!this.game || !this.checkAuth() || !this.selectedPlatform) return;

    const platformId = this.getSelectedPlatformId();
    if (!platformId) return;

    this.cartItemService.getAll().subscribe({
      next: (items) => {
        const existingItem = items.find(
          (item) =>
            Number(item.gameId) === Number(this.game!.id) &&
            Number(item.platformId) === platformId,
        );

        this.cartItemService
          .add({
            gameId: Number(this.game!.id),
            platformId,
            quantity: 1,
          } as CartItem)
          .subscribe({
            next: () => {
              if (existingItem) {
                this.quantityIncreased.set(true);
                setTimeout(() => this.quantityIncreased.set(false), 2000);
              } else {
                this.addedToCartSuccess.set(true);
                setTimeout(() => this.addedToCartSuccess.set(false), 2000);
              }
            },
            error: (err) => {
              if (err.status === 401) {
                this.router.navigate(['/login']);
              }
            },
          });
      },
    });
  }

  /** Incrementa la cantidad de un artículo ya existente en el carrito. */
  private increaseQuantity(platformId: number) {
    if (!this.game) return;
    this.cartItemService.getAll().subscribe({
      next: (items) => {
        const existingItem = items.find(
          (item) =>
            item.gameId === this.game!.id && item.platformId === platformId,
        );
        if (existingItem) {
          this.cartItemService
            .updateWithPlatform(
              this.game!.id,
              platformId,
              existingItem.quantity + 1,
            )
            .subscribe({
              next: () => {
                this.quantityIncreased.set(true);
                setTimeout(() => this.quantityIncreased.set(false), 2000);
              },
            });
        }
      },
    });
  }

  /** Añade el producto a la lista de favoritos. */
  addToFavorites() {
    if (!this.game || !this.checkAuth() || !this.selectedPlatform) return;

    const platformId = this.getSelectedPlatformId();
    if (!platformId) return;

    this.favoriteService
      .add({ gameId: Number(this.game.id), platformId } as Favorite)
      .subscribe({
        next: () => {
          this.addedToFavoritesSuccess.set(true);
          setTimeout(() => this.addedToFavoritesSuccess.set(false), 2000);
        },
        error: (err) => {
          if (err.status === 401) {
            this.router.navigate(['/login']);
          } else if (err.status === 409) {
            this.alreadyInFavorites.set(true);
            setTimeout(() => this.alreadyInFavorites.set(false), 3000);
          }
        },
      });
  }

  /**
   * Añade al carrito y redirige inmediatamente a la página de pago/carrito.
   */
  buyNow() {
    if (!this.game || !this.checkAuth() || !this.selectedPlatform) return;

    const platformId = this.getSelectedPlatformId();
    if (!platformId) return;

    this.cartItemService
      .add({
        gameId: Number(this.game.id),
        platformId,
        quantity: 1,
      } as CartItem)
      .subscribe({
        next: () => {
          this.buySuccess.set(true);
          setTimeout(() => {
            this.buySuccess.set(false);
            this.router.navigate(['/cart']);
          }, 500);
        },
        error: (err) => {
          if (err.status === 401) {
            this.router.navigate(['/login']);
          } else if (err.status === 409) {
            this.buySuccess.set(true);
            setTimeout(() => {
              this.buySuccess.set(false);
              this.router.navigate(['/cart']);
            }, 500);
          }
        },
      });
  }

  /** Comprueba si el juego está disponible para una plataforma dada. */
  isPlatformAvailable(platformName: string): boolean {
    return this.game?.platforms?.some((p) => p.name === platformName) || false;
  }

  /** Selecciona o deselecciona una plataforma. */
  selectPlatform(platform: string): void {
    this.selectedPlatform =
      this.selectedPlatform === platform ? null : platform;
  }

  /** Retrocede al medio anterior en el visor. */
  previousMedia(): void {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
    }
  }

  /** Avanza al siguiente medio en el visor. */
  nextMedia(): void {
    if (this.currentMediaIndex < this.mediaItems.length - 1) {
      this.currentMediaIndex++;
    }
  }

  /** Selecciona un medio específico por su índice. */
  selectMedia(index: number): void {
    this.currentMediaIndex = index;
  }

  /** Calcula cuántas estrellas llenas mostrar en el rating. */
  getRatingStars(): number[] {
    const rating = this.game?.rating || 0;
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0);
  }

  /** Calcula cuántas estrellas vacías mostrar en el rating. */
  getEmptyStars(): number[] {
    const rating = this.game?.rating || 0;
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return Array(emptyStars).fill(0);
  }

  /** Extrae el ID de vídeo de una URL de YouTube. */
  private getVideoId(url: string): string | null {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    return videoIdMatch ? videoIdMatch[1] : null;
  }

  /** Convierte una URL de YouTube estándar en una URL de inserción (embed) segura. */
  private convertToEmbedUrl(url: string): string {
    const videoId = this.getVideoId(url);
    if (videoId) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1${originParam}`;
    }
    return url;
  }
}
