import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  Inject,
  HostListener,
  Renderer2,
} from '@angular/core';
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
import { LocalizedCurrencyPipe } from '../../shared/pipes/localized-currency.pipe';
import { PageTitleService } from '../../core/services/page-title.service';
import { DOCUMENT } from '@angular/common';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { StripeModalComponent } from '../../shared/components/stripe-checkout/stripe-checkout.component';
import { Subscription } from 'rxjs';

interface MediaItem {
  type: 'video' | 'image';
  label: string;
  url?: string | SafeResourceUrl;
  thumbnail?: string;
}

interface RecommendationSection {
  titleKey: string;
  sectionId: string;
  items: Game[];
}

/**
 * Componente de la página de detalle de un producto (juego).
 * Muestra información exhaustiva, galería de medios (vídeo/imágenes),
 * selección de plataformas y opciones de compra/favoritos.
 */
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LocalizedCurrencyPipe,
    CarouselComponent,
    StripeModalComponent,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit, OnDestroy {
  /** Objeto del juego cargado. */
  game: Game | null = this.createPlaceholder();
  /** Plataforma seleccionada actualmente por el usuario. */
  selectedPlatform: string | null = null;
  /** Índice del medio (vídeo/imagen) que se muestra en el visor principal. */
  currentMediaIndex: number = 0;
  /** Lista de elementos multimedia procesados para el visor. */
  mediaItems: MediaItem[] = [];
  recommendationSections: RecommendationSection[] = [];
  recommendationSkeletonSections: RecommendationSection[] = this.createRecommendationSkeletons();
  loadingRecommendations = true;
  private routeSub?: Subscription;

  /** Estados para notificaciones visuales y modales. */
  showAuthModal = signal(false);
  isAuthenticated = signal(false);
  addedToCartSuccess = signal(false);
  addedToFavoritesSuccess = signal(false);
  buySuccess = signal(false);
  quantityIncreased = signal(false);
  alreadyInCart = signal(false);
  alreadyInFavorites = signal(false);
  isScreenshotModalOpen = signal(false);
  screenshotModalImage = signal<string | null>(null);
  checkoutModalOpen = signal(false);
  directCheckoutPayload = signal<{ gameId: number; platformId: number } | null>(null);

  /** Configuración estática de todas las plataformas soportadas. */
  allPlatforms = [
    {
      name: 'PC',
      image: 'assets/images/platforms/pc.webp',
      stockKey: 'stockPc' as const,
    },
    {
      name: 'PS5',
      image: 'assets/images/platforms/ps5.webp',
      stockKey: 'stockPs5' as const,
    },
    {
      name: 'Xbox Series X',
      image: 'assets/images/platforms/xbox-series-x.webp',
      stockKey: 'stockXboxX' as const,
    },
    {
      name: 'Switch',
      image: 'assets/images/platforms/switch.webp',
      stockKey: 'stockSwitch' as const,
    },
    {
      name: 'PS4',
      image: 'assets/images/platforms/ps4.webp',
      stockKey: 'stockPs4' as const,
    },
    {
      name: 'Xbox One',
      image: 'assets/images/platforms/xbox-one.webp',
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
    private pageTitleService: PageTitleService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  /**
   * Inicializa el componente cargando el juego según el ID de la ruta.
   */
  ngOnInit(): void {
    this.game = this.createPlaceholder();
    this.buildMediaItems();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.game = this.createPlaceholder();
        this.buildMediaItems();
        this.recommendationSections = [];
        this.recommendationSkeletonSections = this.createRecommendationSkeletons();
        this.loadingRecommendations = true;
        this.currentMediaIndex = 0;
        this.selectedPlatform = null;
        this.loadGame(id);
      }
    });

    this.authService.authenticated$.subscribe((isAuth) => {
      this.isAuthenticated.set(isAuth);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.renderer.removeStyle(this.document.body, 'overflow');
    this.checkoutModalOpen.set(false);
    this.directCheckoutPayload.set(null);
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

  private createCarouselPlaceholders(count = 20): Game[] {
    return Array(count).fill({
      id: -1,
      title: 'common.loading',
      description: '',
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
    } as unknown as Game);
  }

  private createRecommendationSkeletons(): RecommendationSection[] {
    const placeholders = this.createCarouselPlaceholders();
    return [
      {
        titleKey: 'product.similarGames',
        sectionId: 'similar-games',
        items: placeholders,
      },
      {
        titleKey: 'product.sameStudioGames',
        sectionId: 'same-studio-games',
        items: placeholders,
      },
      {
        titleKey: 'product.relatedGenres',
        sectionId: 'related-genres-games',
        items: placeholders,
      },
      {
        titleKey: 'product.topOnPlatforms',
        sectionId: 'top-platform-games',
        items: placeholders,
      },
    ];
  }

  /**
   * Carga los datos del juego y sus medios asociados.
   * Selecciona automáticamente la plataforma si solo hay una disponible.
   * @param id ID del juego.
   */
  loadGame(id: string): void {
    this.loadingRecommendations = true;
    this.recommendationSections = [];
    this.recommendationSkeletonSections = this.createRecommendationSkeletons();
    this.gameService.getById(id).subscribe((game) => {
      if (game) {
        this.mediaService.getAll({}).subscribe((allMedia) => {
          game.media = allMedia.filter((m) => m.gameId === game.id);
          this.game = game;
          this.pageTitleService.setProductTitle(game.title);
          this.buildMediaItems();
          this.loadRecommendationCarousels(game, allMedia);

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

  private loadRecommendationCarousels(baseGame: Game, allMedia: any[]): void {
    this.gameService.getAll({}).subscribe({
      next: (allGames) => {
        const mediaByGameId = new Map<number, any[]>();
        for (const media of allMedia) {
          if (typeof media.gameId !== 'number') continue;
          if (!mediaByGameId.has(media.gameId)) {
            mediaByGameId.set(media.gameId, []);
          }
          mediaByGameId.get(media.gameId)!.push(media);
        }

        const candidates = allGames
          .filter((g) => g.id !== baseGame.id)
          .map((g) => ({
            ...g,
            media: mediaByGameId.get(g.id) ?? [],
          }));

        const popularFallback = [...candidates].sort(
          (a, b) =>
            (b.numberOfSales ?? 0) - (a.numberOfSales ?? 0) ||
            (b.rating ?? 0) - (a.rating ?? 0),
        );
        const usedIds = new Set<number>();
        const takeUnique = (items: Game[], amount: number): Game[] => {
          const picked: Game[] = [];
          for (const game of items) {
            if (picked.length >= amount) break;
            if (usedIds.has(game.id)) continue;
            picked.push(game);
            usedIds.add(game.id);
          }
          return picked;
        };
        const fillWithFallback = (primary: Game[], amount: number): Game[] => {
          const picked = takeUnique(primary, amount);
          if (picked.length < amount) {
            picked.push(...takeUnique(popularFallback, amount - picked.length));
          }
          return picked;
        };

        const similarRanked = candidates
          .map((candidate) => ({
            game: candidate,
            score: this.scoreSimilarity(baseGame, candidate),
          }))
          .filter((x) => x.score > 0)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (
              (b.game.numberOfSales ?? 0) - (a.game.numberOfSales ?? 0) ||
              (b.game.rating ?? 0) - (a.game.rating ?? 0)
            );
          })
          .map((x) => x.game);
        const similarGames = fillWithFallback(similarRanked, 20);

        const sameStudioPool = candidates
          .filter(
            (g) =>
              (baseGame.developerId && g.developerId === baseGame.developerId) ||
              (baseGame.publisherId && g.publisherId === baseGame.publisherId),
          )
          .sort(
            (a, b) =>
              (b.numberOfSales ?? 0) - (a.numberOfSales ?? 0) ||
              (b.rating ?? 0) - (a.rating ?? 0),
          );
        const sameStudioGames = fillWithFallback(sameStudioPool, 20);

        const baseGenres = new Set(
          (baseGame.genres ?? []).map((g) => g.name.toLowerCase().trim()),
        );
        const relatedGenresPool = candidates
          .filter((g) =>
            (g.genres ?? []).some((genre) =>
              baseGenres.has(genre.name.toLowerCase().trim()),
            ),
          )
          .sort(
            (a, b) =>
              (b.rating ?? 0) - (a.rating ?? 0) ||
              (b.numberOfSales ?? 0) - (a.numberOfSales ?? 0),
          );
        const relatedGenresGames = fillWithFallback(relatedGenresPool, 20);

        const basePlatforms = new Set(
          (baseGame.platforms ?? []).map((p) => p.name.toLowerCase().trim()),
        );
        const topOnPlatformsPool = candidates
          .filter((g) =>
            (g.platforms ?? []).some((platform) =>
              basePlatforms.has(platform.name.toLowerCase().trim()),
            ),
          )
          .sort(
            (a, b) =>
              (b.numberOfSales ?? 0) - (a.numberOfSales ?? 0) ||
              (b.rating ?? 0) - (a.rating ?? 0),
          );
        const topOnPlatformsGames = fillWithFallback(topOnPlatformsPool, 20);

        const sections: RecommendationSection[] = [
          {
            titleKey: 'product.similarGames',
            sectionId: 'similar-games',
            items: similarGames,
          },
          {
            titleKey: 'product.sameStudioGames',
            sectionId: 'same-studio-games',
            items: sameStudioGames,
          },
          {
            titleKey: 'product.relatedGenres',
            sectionId: 'related-genres-games',
            items: relatedGenresGames,
          },
          {
            titleKey: 'product.topOnPlatforms',
            sectionId: 'top-platform-games',
            items: topOnPlatformsGames,
          },
        ];

        this.recommendationSections = sections;
        this.loadingRecommendations = false;
      },
      error: () => {
        this.recommendationSections = [];
        this.loadingRecommendations = false;
      },
    });
  }

  private scoreSimilarity(base: Game, candidate: Game): number {
    let score = 0;

    if (base.developerId && candidate.developerId === base.developerId) {
      score += 4;
    }

    if (base.publisherId && candidate.publisherId === base.publisherId) {
      score += 3;
    }

    const baseGenres = new Set(
      (base.genres ?? []).map((g) => g.name.toLowerCase().trim()),
    );
    const candidateGenres = new Set(
      (candidate.genres ?? []).map((g) => g.name.toLowerCase().trim()),
    );
    let sharedGenres = 0;
    for (const genre of baseGenres) {
      if (candidateGenres.has(genre)) sharedGenres++;
    }
    score += sharedGenres * 3;

    const basePlatforms = new Set(
      (base.platforms ?? []).map((p) => p.name.toLowerCase().trim()),
    );
    const candidatePlatforms = new Set(
      (candidate.platforms ?? []).map((p) => p.name.toLowerCase().trim()),
    );
    let sharedPlatforms = 0;
    for (const platform of basePlatforms) {
      if (candidatePlatforms.has(platform)) sharedPlatforms++;
    }
    score += sharedPlatforms * 2;

    const basePrice = (base.isOnSale ? base.salePrice : base.price) ?? 0;
    const candidatePrice =
      (candidate.isOnSale ? candidate.salePrice : candidate.price) ?? 0;
    const priceDiff = Math.abs(basePrice - candidatePrice);
    if (priceDiff <= 5) score += 2;
    else if (priceDiff <= 15) score += 1;

    const baseRating = base.rating ?? 0;
    const candidateRating = candidate.rating ?? 0;
    if (Math.abs(baseRating - candidateRating) <= 0.7) score += 1;

    if (base.isOnSale && candidate.isOnSale) score += 1;

    return score;
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
        url: 'assets/images/ui/placeholder.webp',
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

  openScreenshotModal(imageUrl: string): void {
    if (!imageUrl) return;
    this.screenshotModalImage.set(imageUrl);
    this.isScreenshotModalOpen.set(true);
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  closeScreenshotModal(): void {
    this.isScreenshotModalOpen.set(false);
    this.screenshotModalImage.set(null);
    this.renderer.removeStyle(this.document.body, 'overflow');
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
   * Prepara compra individual y abre Stripe directamente.
   */
  buyNow() {
    if (!this.game || !this.checkAuth() || !this.selectedPlatform) return;

    const platformId = this.getSelectedPlatformId();
    if (!platformId) return;
    this.directCheckoutPayload.set({
      gameId: Number(this.game.id),
      platformId,
    });
    this.buySuccess.set(true);
    setTimeout(() => this.buySuccess.set(false), 500);
    this.checkoutModalOpen.set(true);
  }

  closeCheckoutModal(): void {
    this.checkoutModalOpen.set(false);
    this.directCheckoutPayload.set(null);
  }

  onCheckoutCompleted(): void {
    this.checkoutModalOpen.set(false);
    this.directCheckoutPayload.set(null);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(id);
    }
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

  goToProduct(id: number): void {
    if (!Number.isFinite(id) || id <= 0) return;
    if (this.game?.id !== id) {
      this.game = this.createPlaceholder();
      this.buildMediaItems();
      this.recommendationSections = [];
      this.recommendationSkeletonSections = this.createRecommendationSkeletons();
      this.loadingRecommendations = true;
      this.currentMediaIndex = 0;
      this.selectedPlatform = null;
    }
    this.router.navigateByUrl(`/product/${id}`);
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
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
    }
    return url;
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isScreenshotModalOpen()) {
      this.closeScreenshotModal();
    }
  }
}
