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
  @ViewChild('titleLayer') titleLayer!: ElementRef;
  @ViewChild('geraltLayer') geraltLayer!: ElementRef;
  @ViewChild('bottomLayer') bottomLayer!: ElementRef;
  @ViewChild('mainContent') mainContent!: ElementRef;

  genres = [
    { value: 'Accion', key: 'genres.action' },
    { value: 'Aventura', key: 'genres.adventure' },
    { value: 'RPG', key: 'genres.rpg' },
    { value: 'Deportes', key: 'genres.sports' },
    { value: 'Estrategia', key: 'genres.strategy' },
    { value: 'Simulacion', key: 'genres.simulation' },
    { value: 'Terror', key: 'genres.horror' },
    { value: 'Carreras', key: 'genres.racing' },
  ];

  allGenres = [
    { value: 'Accion', key: 'genres.action' },
    { value: 'Aventura', key: 'genres.adventure' },
    { value: 'RPG', key: 'genres.rpg' },
    { value: 'Deportes', key: 'genres.sports' },
    { value: 'Estrategia', key: 'genres.strategy' },
    { value: 'Simulacion', key: 'genres.simulation' },
    { value: 'Terror', key: 'genres.horror' },
    { value: 'Carreras', key: 'genres.racing' },
    { value: 'Sandbox', key: 'genres.sandbox' },
    { value: 'TBS', key: 'genres.tbs' },
    { value: 'Shooter', key: 'genres.shooter' },
    { value: 'Acción-Aventura', key: 'genres.action-adventure' },
    { value: 'RTS', key: 'genres.rts' },
    { value: 'Ciencia Ficción', key: 'genres.sci-fi' },
    { value: 'Gestión', key: 'genres.management' },
    { value: 'Construcción de Ciudades', key: 'genres.city-building' },
    { value: 'Exploración', key: 'genres.exploration' },
    { value: 'Supervivencia', key: 'genres.survival' },
    { value: 'Survival Horror', key: 'genres.survival-horror' },
    { value: 'Educativo', key: 'genres.educational' },
  ];

  otherGenres: { value: string; key: string }[] = [];
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
      (genre) => !this.genres.some((g) => g.value === genre.value)
    );
    this.loadGames();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollPosition = window.scrollY;

    const backgroundSpeed = 0.8;
    const charactersSpeed = 0.4;
    const bottomSpeed = 0.1;
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
    const bottomParallaxOffset = scrollPosition * bottomSpeed;
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
    if (this.titleLayer) {
      this.titleLayer.nativeElement.style.transform = `translate3d(-50%, calc(-50% + ${
        scrollPosition * charactersSpeed
      }px), 0)`;
      this.titleLayer.nativeElement.style.filter = `drop-shadow(0 0 15px #ffffff) blur(${blurCharactersAmount}px)`;
    }
    if (this.bottomLayer) {
      this.bottomLayer.nativeElement.style.transform = `translateY(${bottomParallaxOffset}px)`;
      // Eliminada la linea que forzaba filter = 'none' para respetar el drop-shadow del CSS
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
    this.router.navigate(['/search'], { queryParams: { genre: nombre } });
  }

  createPlaceholders(): Game[] {
    return Array(20).fill({
      id: -1,
      title: 'common.loading',
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
