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

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  game: Game | null = this.createPlaceholder();
  selectedPlatform: string | null = null;
  currentMediaIndex: number = 0;
  mediaItems: MediaItem[] = [];
  showAuthModal = signal(false);
  isAuthenticated = signal(false);
  addedToCartSuccess = signal(false);
  addedToFavoritesSuccess = signal(false);
  buySuccess = signal(false);
  quantityIncreased = signal(false);
  alreadyInCart = signal(false);
  alreadyInFavorites = signal(false);

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

  get sortedPlatforms() {
    return [...this.allPlatforms].sort((a, b) => {
      const aAvailable = this.isPlatformAvailable(a.name);
      const bAvailable = this.isPlatformAvailable(b.name);
      if (aAvailable === bAvailable) return 0;
      return aAvailable ? -1 : 1;
    });
  }

  get coverImage(): string | undefined {
    return this.game?.media?.find((m) =>
      m.altText?.toLowerCase().includes('cover')
    )?.url;
  }

  get screenshot1(): string | undefined {
    return this.game?.media?.find(
      (m) =>
        m.altText?.toLowerCase().includes('screenshot1') ||
        m.altText?.toLowerCase().includes('screenshot 1')
    )?.url;
  }

  get screenshot2(): string | undefined {
    return this.game?.media?.find(
      (m) =>
        m.altText?.toLowerCase().includes('screenshot2') ||
        m.altText?.toLowerCase().includes('screenshot 2')
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
    @Inject(Router) private router: Router
  ) {}

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

  loadGame(id: string): void {
    this.gameService.getById(id).subscribe((game) => {
      if (game) {
        this.mediaService.getAll({}).subscribe((allMedia) => {
          game.media = allMedia.filter((m) => m.gameId === game.id);
          this.game = game;
          this.buildMediaItems();

          const availablePlatforms = this.allPlatforms.filter((platform) =>
            this.isPlatformAvailable(platform.name)
          );

          if (availablePlatforms.length === 1) {
            this.selectedPlatform = availablePlatforms[0].name;
          }
        });
      }
    });
  }

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

    if (this.coverImage) {
      this.mediaItems.push({
        type: 'image',
        label: 'Cover',
        url: this.coverImage,
      });
    }
  }

  getStockForPlatform(platformName: string | null): number {
    if (!this.game || !platformName) return 0;
    const platform = this.allPlatforms.find((p) => p.name === platformName);
    if (!platform) return 0;
    return (this.game as any)[platform.stockKey] || 0;
  }

  getSelectedPlatformId(): number | null {
    if (!this.selectedPlatform || !this.game?.platforms) return null;
    const platform = this.game.platforms.find(
      (p) => p.name === this.selectedPlatform
    );
    return platform?.id || null;
  }

  checkAuth(): boolean {
    if (!this.isAuthenticated()) {
      this.showAuthModal.set(true);
      return false;
    }
    return true;
  }

  confirmLogin() {
    this.showAuthModal.set(false);
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  cancelLogin() {
    this.showAuthModal.set(false);
  }

  addToCart() {
    if (!this.game || !this.checkAuth() || !this.selectedPlatform) return;

    const platformId = this.getSelectedPlatformId();
    if (!platformId) return;

    this.cartItemService.getAll().subscribe({
      next: (items) => {
        const existingItem = items.find(
          (item) =>
            Number(item.gameId) === Number(this.game!.id) &&
            Number(item.platformId) === platformId
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

  private increaseQuantity(platformId: number) {
    if (!this.game) return;
    this.cartItemService.getAll().subscribe({
      next: (items) => {
        const existingItem = items.find(
          (item) =>
            item.gameId === this.game!.id && item.platformId === platformId
        );
        if (existingItem) {
          this.cartItemService
            .updateWithPlatform(
              this.game!.id,
              platformId,
              existingItem.quantity + 1
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

  isPlatformAvailable(platformName: string): boolean {
    return this.game?.platforms?.some((p) => p.name === platformName) || false;
  }

  selectPlatform(platform: string): void {
    this.selectedPlatform =
      this.selectedPlatform === platform ? null : platform;
  }

  previousMedia(): void {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
    }
  }

  nextMedia(): void {
    if (this.currentMediaIndex < this.mediaItems.length - 1) {
      this.currentMediaIndex++;
    }
  }

  selectMedia(index: number): void {
    this.currentMediaIndex = index;
  }

  getRatingStars(): number[] {
    const rating = this.game?.rating || 0;
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0);
  }

  getEmptyStars(): number[] {
    const rating = this.game?.rating || 0;
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return Array(emptyStars).fill(0);
  }

  private getVideoId(url: string): string | null {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    return videoIdMatch ? videoIdMatch[1] : null;
  }

  private convertToEmbedUrl(url: string): string {
    const videoId = this.getVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
    }
    return url;
  }
}
