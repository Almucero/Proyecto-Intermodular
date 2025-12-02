import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GameService } from '../../core/services/impl/game.service';
import { MediaService } from '../../core/services/impl/media.service';
import { Game } from '../../core/models/game.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, TranslatePipe, GameCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  genres = [
    'genres.action',
    'genres.adventure',
    'genres.rpg',
    'genres.sports',
    'genres.strategy',
    'genres.simulation',
    'genres.horror',
    'genres.racing',
  ];

  bestSellers: Game[] = this.createPlaceholders();
  onSaleGames: Game[] = this.createPlaceholders();
  topRatedGames: Game[] = this.createPlaceholders();

  safeVideoUrls: Map<number, SafeUrl> = new Map();
  hoveredGameId: number | null = null;

  isDragging = false;
  startX = 0;
  scrollLeftPos = 0;

  arrowState: { [key: string]: { left: boolean; right: boolean } } = {
    masVendidos: { left: false, right: true },
    ofertas: { left: false, right: true },
    mejorValorados: { left: false, right: true },
  };

  @ViewChildren('gameTitle') gameTitleElements!: QueryList<ElementRef>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private gameService: GameService,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadGames();
  }

  ngAfterViewInit(): void {
    this.gameTitleElements.changes.subscribe(() => {
      window.requestAnimationFrame(() => this.checkLongTitles());
    });
    window.requestAnimationFrame(() => this.checkLongTitles());
  }

  checkLongTitles(): void {
    this.gameTitleElements.forEach((titleElement) => {
      const spanElement = titleElement.nativeElement as HTMLSpanElement;
      const containerElement = spanElement.parentElement as HTMLElement;
      if (spanElement.scrollWidth > containerElement.clientWidth + 1) {
        spanElement.classList.add('long-text-animate');
      } else {
        spanElement.classList.remove('long-text-animate');
      }
    });
  }

  loadGames() {
    this.gameService.getAll({}).subscribe((games) => {
      this.mediaService.getAll({}).subscribe((allMedia) => {
        games.forEach((game) => {
          game.media = allMedia.filter((m) => m.gameId === game.id);
          if (game.videoUrl) {
            this.safeVideoUrls.set(
              game.id,
              this.sanitizer.bypassSecurityTrustUrl(game.videoUrl)
            );
          }
        });

        this.bestSellers = [...games]
          .sort((a, b) => b.numberOfSales - a.numberOfSales)
          .slice(0, 10);
        const excludedIds = new Set(this.bestSellers.map((g) => g.id));
        this.onSaleGames = games
          .filter((g) => g.isOnSale && !excludedIds.has(g.id))
          .slice(0, 10);
        this.onSaleGames.forEach((g) => excludedIds.add(g.id));
        this.topRatedGames = [...games]
          .filter((g) => !excludedIds.has(g.id))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10);
        setTimeout(() => this.checkLongTitles(), 0);
      });
    });
  }

  getSafeVideo(gameId: number): SafeUrl | undefined {
    return this.safeVideoUrls.get(gameId);
  }

  getCoverUrl(game: Game): string {
    if (!game.media || game.media.length === 0) {
      return 'assets/images/placeholder.png';
    }
    const cover = game.media.find((m) =>
      m.originalName?.toLowerCase().includes('cover')
    );
    return cover ? cover.url : game.media[0].url;
  }

  onGameMouseEnter(gameId: number): void {
    this.hoveredGameId = gameId;
  }

  onGameMouseLeave(): void {
    this.hoveredGameId = null;
  }

  scrollLeft(carousel: HTMLElement, section: string) {
    carousel.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(carousel, section), 350);
  }

  scrollRight(carousel: HTMLElement, section: string) {
    carousel.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(carousel, section), 350);
  }

  updateScrollState(carousel: HTMLElement, section: string) {
    const scrollLeft = carousel.scrollLeft;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    this.arrowState[section] = {
      left: scrollLeft > 1,
      right: scrollLeft < maxScrollLeft - 1,
    };
  }

  goToProduct(id: number) {
    if (!this.isDragging) {
      this.router.navigate(['/product', id]);
    }
  }

  goToGenres(nombre: string) {
    this.router.navigate(['/genres', nombre.toLowerCase()]);
  }

  onMouseDown(e: MouseEvent, carousel: HTMLElement) {
    this.isDragging = false;
    this.startX = e.pageX - carousel.offsetLeft;
    this.scrollLeftPos = carousel.scrollLeft;
    e.preventDefault();
  }

  onMouseLeave(carousel: HTMLElement) {
    this.isDragging = false;
  }

  onMouseUp(carousel: HTMLElement) {
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
  }

  onMouseMove(e: MouseEvent, carousel: HTMLElement) {
    if (e.buttons !== 1) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = x - this.startX;
    carousel.scrollLeft = this.scrollLeftPos - walk;
    if (Math.abs(walk) > 5) {
      this.isDragging = true;
    }
  }

  createPlaceholders(): Game[] {
    return Array(10).fill({
      id: -1,
      title: 'Loading...',
      price: 0,
      description: '',
      releaseDate: new Date(),
      rating: 0,
      numberOfSales: 0,
      isOnSale: false,
      isRefundable: false,
      stock: 0,
      media: [],
    } as unknown as Game);
  }
}
