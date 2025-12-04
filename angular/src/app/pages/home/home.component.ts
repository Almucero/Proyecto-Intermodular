import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { GameService } from '../../core/services/impl/game.service';
import { MediaService } from '../../core/services/impl/media.service';
import { Game } from '../../core/models/game.model';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, TranslatePipe, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('backgroundLayer') backgroundLayer!: ElementRef;
  @ViewChild('jokerLayer') jokerLayer!: ElementRef;
  @ViewChild('geraltLayer') geraltLayer!: ElementRef;
  @ViewChild('wavesLayer') wavesLayer!: ElementRef;
  @ViewChild('mainContent') mainContent!: ElementRef;

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

  allGenres = [
    'genres.action',
    'genres.adventure',
    'genres.rpg',
    'genres.sports',
    'genres.strategy',
    'genres.simulation',
    'genres.horror',
    'genres.racing',
    'genres.platform',
    'genres.puzzle',
    'genres.fighting',
    'genres.music',
    'genres.action-adventure',
    'genres.shooter',
    'genres.moba',
    'genres.roguelike',
    'genres.sandbox',
    'genres.mmorpg',
    'genres.battle-royale',
    'genres.survival-horror',
    'genres.metroidvania',
    'genres.rts',
    'genres.tbs',
    'genres.hack-and-slash',
    'genres.beat-em-up',
    'genres.visual-novel',
    'genres.ccg',
    'genres.fps',
    'genres.tactical',
    'genres.sci-fi',
    'genres.educational',
    'genres.management',
    'genres.city-building',
    'genres.exploration',
    'genres.survival',
    'genres.psychological-horror',
    'genres.stealth',
    'genres.cinematic',
    'genres.narrative',
    'genres.cooperative',
    'genres.arcade',
    'genres.open-world',
    'genres.off-road',
    'genres.simcade',
  ];

  otherGenres: string[] = [];
  showAllGenres = false;
  isClosingGenreDropdown = false;

  bestSellers: Game[] = this.createPlaceholders();
  onSaleGames: Game[] = this.createPlaceholders();
  topRatedGames: Game[] = this.createPlaceholders();

  private router = inject(Router);
  private http = inject(HttpClient);

  constructor(
    private gameService: GameService,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.otherGenres = this.allGenres.filter(
      (genre) => !this.genres.includes(genre)
    );
    this.loadGames();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollPosition = window.scrollY;

    const backgroundSpeed = 0.8;
    const charactersSpeed = 0.4;
    const wavesSpeed = 0.1;
    const mainContentSpeed = 0.05;

    const maxBlurBackground = 5;
    const blurBackgroundAmount = Math.min(
      scrollPosition * 0.005,
      maxBlurBackground
    );
    const maxBlurCharacters = 2;
    const blurCharactersAmount = Math.min(
      scrollPosition * 0.003,
      maxBlurCharacters
    );
    const horizontalMovement = Math.sin(scrollPosition * 0.0005) * 50;

    const backgroundParallaxOffset = scrollPosition * backgroundSpeed;
    const wavesParallaxOffset = scrollPosition * wavesSpeed;
    const mainContentOffset = scrollPosition * mainContentSpeed;

    if (this.backgroundLayer) {
      this.backgroundLayer.nativeElement.style.transform = `translateY(${backgroundParallaxOffset}px)`;
      this.backgroundLayer.nativeElement.style.filter = `blur(${blurBackgroundAmount}px)`;
    }
    if (this.jokerLayer) {
      this.jokerLayer.nativeElement.style.transform = `translate3d(${-horizontalMovement}px, ${
        scrollPosition * charactersSpeed
      }px, 0)`;
      this.jokerLayer.nativeElement.style.filter = `drop-shadow(0 0 15px #ffffff) blur(${blurCharactersAmount}px)`;
    }
    if (this.geraltLayer) {
      this.geraltLayer.nativeElement.style.transform = `translate3d(${horizontalMovement}px, ${
        scrollPosition * charactersSpeed
      }px, 0)`;
      this.geraltLayer.nativeElement.style.filter = `drop-shadow(0 0 15px #ffffff) blur(${blurCharactersAmount}px)`;
    }
    if (this.wavesLayer) {
      this.wavesLayer.nativeElement.style.transform = `translateY(${wavesParallaxOffset}px)`;
      this.wavesLayer.nativeElement.style.filter = 'none';
    }
    if (this.mainContent) {
      this.mainContent.nativeElement.style.transform = `translateY(${mainContentOffset}px)`;
    }
  }

  toggleAllGenres(): void {
    if (this.showAllGenres) {
      this.closeGenreDropdown();
    } else {
      this.showAllGenres = true;
      this.isClosingGenreDropdown = false;
    }
  }

  closeGenreDropdown(): void {
    this.isClosingGenreDropdown = true;
    setTimeout(() => {
      this.showAllGenres = false;
      this.isClosingGenreDropdown = false;
    }, 200);
  }

  loadGames() {
    this.gameService.getAll({}).subscribe((games) => {
      this.mediaService.getAll({}).subscribe((allMedia) => {
        games.forEach((game) => {
          game.media = allMedia.filter((m) => m.gameId === game.id);
        });

        this.bestSellers = [...games]
          .sort((a, b) => b.numberOfSales - a.numberOfSales)
          .slice(0, 20);
        const excludedIds = new Set(this.bestSellers.map((g) => g.id));
        this.onSaleGames = games
          .filter((g) => g.isOnSale && !excludedIds.has(g.id))
          .slice(0, 20);
        this.onSaleGames.forEach((g) => excludedIds.add(g.id));
        this.topRatedGames = [...games]
          .filter((g) => !excludedIds.has(g.id))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 20);
      });
    });
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  goToGenres(nombre: string) {
    this.router.navigate(['/genres', nombre.toLowerCase()]);
  }

  createPlaceholders(): Game[] {
    return Array(20).fill({
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      if (this.showAllGenres) {
        this.closeGenreDropdown();
      }
    }
  }
}
