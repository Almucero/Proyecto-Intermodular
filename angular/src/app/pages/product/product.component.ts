import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GameService } from '../../core/services/impl/game.service';
import { MediaService } from '../../core/services/impl/media.service';
import { Game } from '../../core/models/game.model';
import { Media } from '../../core/models/media.model';
import { Platform } from '../../core/models/platform.model';

interface MediaItem {
  type: 'video' | 'image';
  label: string;
  url?: string | SafeResourceUrl;
  thumbnail?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  game: Game | null = null;
  selectedPlatform: string | null = null;
  currentMediaIndex: number = 0;
  mediaItems: MediaItem[] = [];
  allPlatforms = [
    { name: 'PC', image: 'assets/images/platforms/pc.png' },
    { name: 'PS5', image: 'assets/images/platforms/ps5.png' },
    {
      name: 'Xbox Series X',
      image: 'assets/images/platforms/xbox-series-x.png',
    },
    { name: 'Switch', image: 'assets/images/platforms/switch.png' },
    { name: 'PS4', image: 'assets/images/platforms/ps4.png' },
    { name: 'Xbox One', image: 'assets/images/platforms/xbox-one.png' },
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
    private route: ActivatedRoute,
    private gameService: GameService,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(id);
    }
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

  getVideoId(url: string): string | null {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    return videoIdMatch ? videoIdMatch[1] : null;
  }

  convertToEmbedUrl(url: string): string {
    const videoId = this.getVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
    }
    return url;
  }

  isPlatformAvailable(platformName: string): boolean {
    return this.game?.platforms?.some((p) => p.name === platformName) || false;
  }

  selectPlatform(platform: string): void {
    if (this.selectedPlatform === platform) {
      this.selectedPlatform = null;
    } else {
      this.selectedPlatform = platform;
    }
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
}
