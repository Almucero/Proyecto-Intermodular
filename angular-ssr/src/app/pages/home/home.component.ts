import {
  AfterViewInit,
  Component,
  NgZone,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { GameService } from '../../core/services/impl/game.service';
import { MediaService } from '../../core/services/impl/media.service';
import { Game } from '../../core/models/game.model';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';

/**
 * Componente de la página de inicio (Landing Page).
 * Presenta juegos destacados, ofertas, categorías y efectos visuales de parallax.
 */
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, TranslatePipe, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Capas para el efecto parallax del banner. */
  @ViewChild('backgroundFallbackLayer') backgroundFallbackLayer!: ElementRef;
  @ViewChild('backgroundLayer') backgroundLayer!: ElementRef;
  @ViewChild('jokerLayer') jokerLayer!: ElementRef;
  @ViewChild('titleLayer') titleLayer!: ElementRef;
  @ViewChild('geraltLayer') geraltLayer!: ElementRef;
  @ViewChild('bottomLayer') bottomLayer!: ElementRef;
  @ViewChild('mainContent') mainContent!: ElementRef;

  /** Lista de géneros principales para el menú de categorías. */
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

  /** Lista completa de todos los géneros disponibles. */
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

  /** Géneros que se muestran en el menú desplegable 'Más'. */
  otherGenres: { value: string; key: string }[] = [];
  /** Indica si se muestra el menú desplegable de géneros. */
  showAllGenres = false;
  /** Estado de transición para el cierre del menú de géneros. */
  isClosingGenreDropdown = false;
  /** Indica si se está visualizando en un dispositivo móvil. */
  isMobile = false;
  hideSideCharacters = false;

  /** Listas de juegos cargados para las diferentes secciones. */
  bestSellers: Game[] = this.createPlaceholders();
  onSaleGames: Game[] = this.createPlaceholders();
  topRatedGames: Game[] = this.createPlaceholders();

  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private targetScrollY = 0;
  private lastTargetScrollY = 0;
  private rafId: number | null = null;
  private genreTiltStates = new Map<
    string,
    {
      el: HTMLElement;
      rafId: number | null;
      currentX: number;
      currentY: number;
      targetX: number;
      targetY: number;
      hoverCurrent: number;
      hoverTarget: number;
    }
  >();
  private genreTiltMaxRotateDeg = 5;
  private genreTiltMaxTranslatePx = 3.5;
  private current = {
    backgroundY: 0,
    bottomY: 0,
    mainContentY: 0,
    charactersY: 0,
    horizontalX: 0,
    blurBackground: 0,
    blurCharacters: 0,
  };
  private overlapCheckFrame = 0;
  private sideCharactersHideLocked = false;
  private lastViewportKey = '';

  constructor(
    private gameService: GameService,
    private mediaService: MediaService,
    private ngZone: NgZone,
  ) {}

  /**
   * Inicializa el componente, configurando géneros y cargando los juegos.
   */
  ngOnInit(): void {
    this.checkScreenSize();
    this.otherGenres = this.allGenres.filter(
      (genre) => !this.genres.some((g) => g.value === genre.value),
    );
    this.loadGames();
    if (isPlatformBrowser(this.platformId)) {
      this.targetScrollY = window.scrollY || 0;
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.targetScrollY = window.scrollY || 0;
    this.lastTargetScrollY = this.targetScrollY;
    this.requestSideCharactersVisibilityCheck();
    this.startParallaxLoop();
  }

  ngOnDestroy(): void {
    if (this.rafId !== null && isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.genreTiltStates.forEach((state) => {
      if (state.rafId !== null) cancelAnimationFrame(state.rafId);
    });
    this.genreTiltStates.clear();
  }

  /** Escucha cambios en el tamaño de la ventana. */
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
    this.requestSideCharactersVisibilityCheck();
  }

  @HostListener('window:orientationchange', [])
  onOrientationChange() {
    this.requestSideCharactersVisibilityCheck();
  }

  /** Determina si la pantalla es móvil o escritorio. */
  private checkScreenSize() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.isMobile = window.innerWidth <= 768;
  }

  /** Géneros visibles en la barra principal según el dispositivo. */
  get visibleGenres() {
    if (this.isMobile) {
      return this.genres.slice(0, 3);
    }
    return this.genres;
  }

  /** Elementos a mostrar en el desplegable de géneros. */
  get dropdownItems() {
    if (this.isMobile) {
      const hiddenMainGenres = this.genres.slice(3);
      return [...hiddenMainGenres, ...this.otherGenres];
    }
    return this.otherGenres;
  }

  /**
   * Maneja el desplazamiento de la ventana para aplicar el efecto parallax
   * a las diferentes capas del banner.
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.targetScrollY = window.scrollY || 0;
    this.startParallaxLoop();
  }

  private startParallaxLoop() {
    if (this.rafId !== null) return;
    this.ngZone.runOutsideAngular(() => {
      const tick = () => {
        this.rafId = requestAnimationFrame(tick);
        this.renderParallaxFrame();
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private renderParallaxFrame() {
    const scrollPosition = this.targetScrollY;
    const scrollingUp = this.targetScrollY < this.lastTargetScrollY;

    const backgroundSpeed = 0.8;
    const charactersSpeed = 0.4;
    const bottomSpeed = 0.1;
    const mainContentSpeed = 0.05;

    const maxBlurBackground = 5;
    const blurBackgroundTarget = Math.min(
      scrollPosition * 0.005,
      maxBlurBackground,
    );
    const maxBlurCharacters = 2;
    const blurCharactersTarget = Math.min(
      scrollPosition * 0.003,
      maxBlurCharacters,
    );
    const horizontalTarget = Math.sin(scrollPosition * 0.0005) * 50;

    const backgroundTarget = scrollPosition * backgroundSpeed;
    const bottomTarget = scrollPosition * bottomSpeed;
    const mainContentTarget = scrollPosition * mainContentSpeed;
    const charactersTarget = scrollPosition * charactersSpeed;

    const ease = 0.16;
    const easeFast = 0.38;
    const backgroundEase = scrollingUp ? easeFast : ease;
    this.current.backgroundY = this.lerp(
      this.current.backgroundY,
      backgroundTarget,
      backgroundEase,
    );
    if (scrollingUp && Math.abs(backgroundTarget - this.current.backgroundY) > 240) {
      this.current.backgroundY = backgroundTarget;
    }
    this.current.bottomY = this.lerp(this.current.bottomY, bottomTarget, ease);
    this.current.mainContentY = this.lerp(
      this.current.mainContentY,
      mainContentTarget,
      ease,
    );
    this.current.charactersY = this.lerp(
      this.current.charactersY,
      charactersTarget,
      ease,
    );
    this.current.horizontalX = this.lerp(
      this.current.horizontalX,
      horizontalTarget,
      ease,
    );
    this.current.blurBackground = this.lerp(
      this.current.blurBackground,
      blurBackgroundTarget,
      0.22,
    );
    this.current.blurCharacters = this.lerp(
      this.current.blurCharacters,
      blurCharactersTarget,
      0.22,
    );

    const bgY = this.current.backgroundY;
    const bottomY = this.current.bottomY;
    const mainY = this.current.mainContentY;
    const charY = this.current.charactersY;
    const x = this.current.horizontalX;
    const blurBg = this.current.blurBackground;
    const blurChars = this.current.blurCharacters;

    if (this.backgroundLayer) {
      const el = this.backgroundLayer.nativeElement as HTMLElement;
      el.style.transform = `translate3d(0, ${bgY - 120}px, 0)`;
      el.style.filter = `blur(${blurBg}px)`;
    }
    if (this.backgroundFallbackLayer) {
      const el = this.backgroundFallbackLayer.nativeElement as HTMLElement;
      el.style.filter = `blur(${blurBg}px)`;
    }
    if (this.jokerLayer) {
      const el = this.jokerLayer.nativeElement as HTMLElement;
      el.style.transform = `translate3d(${-x}px, ${charY}px, 0)`;
      el.style.filter = `drop-shadow(0 0 15px #ffffff) blur(${blurChars}px)`;
    }
    if (this.geraltLayer) {
      const el = this.geraltLayer.nativeElement as HTMLElement;
      el.style.transform = `translate3d(${x}px, ${charY}px, 0)`;
      el.style.filter = `drop-shadow(0 0 15px #ffffff) blur(${blurChars}px)`;
    }
    if (this.titleLayer) {
      const el = this.titleLayer.nativeElement as HTMLElement;
      el.style.transform = `translate(-50%, -50%) translate3d(0, ${charY}px, 0)`;
      el.style.filter = `drop-shadow(0 0 15px #ffffff) blur(${blurChars}px)`;
    }
    if (this.bottomLayer) {
      const el = this.bottomLayer.nativeElement as HTMLElement;
      el.style.transform = `translate3d(0, ${bottomY}px, 0)`;
    }
    if (this.mainContent) {
      const el = this.mainContent.nativeElement as HTMLElement;
      el.style.transform = `translate3d(0, ${mainY}px, 0)`;
    }

    this.overlapCheckFrame++;
    if (this.overlapCheckFrame % 8 === 0) {
      this.updateSideCharactersVisibility();
    }

    this.lastTargetScrollY = this.targetScrollY;

    const done =
      Math.abs(backgroundTarget - this.current.backgroundY) < 0.05 &&
      Math.abs(bottomTarget - this.current.bottomY) < 0.05 &&
      Math.abs(mainContentTarget - this.current.mainContentY) < 0.05 &&
      Math.abs(charactersTarget - this.current.charactersY) < 0.05 &&
      Math.abs(horizontalTarget - this.current.horizontalX) < 0.05 &&
      Math.abs(blurBackgroundTarget - this.current.blurBackground) < 0.02 &&
      Math.abs(blurCharactersTarget - this.current.blurCharacters) < 0.02;

    if (done && this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private lerp(current: number, target: number, alpha: number) {
    return current + (target - current) * alpha;
  }

  private requestSideCharactersVisibilityCheck() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.refreshSideCharactersLockForViewport();
    this.updateSideCharactersVisibility();
    requestAnimationFrame(() => {
      this.updateSideCharactersVisibility();
      requestAnimationFrame(() => this.updateSideCharactersVisibility());
    });
    setTimeout(() => this.updateSideCharactersVisibility(), 120);
  }

  private refreshSideCharactersLockForViewport() {
    const viewportKey = `${window.innerWidth}x${window.innerHeight}`;
    if (viewportKey !== this.lastViewportKey) {
      this.lastViewportKey = viewportKey;
      this.sideCharactersHideLocked = false;
    }
  }

  updateSideCharactersVisibility() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.jokerLayer || !this.geraltLayer || !this.titleLayer) return;
    this.refreshSideCharactersLockForViewport();

    if (this.sideCharactersHideLocked) {
      this.hideSideCharacters = true;
      return;
    }

    const titleRect = (this.titleLayer.nativeElement as HTMLElement).getBoundingClientRect();
    const jokerRect = (this.jokerLayer.nativeElement as HTMLElement).getBoundingClientRect();
    const geraltRect = (this.geraltLayer.nativeElement as HTMLElement).getBoundingClientRect();

    if (titleRect.width <= 0 || titleRect.height <= 0) {
      return;
    }

    const shrinkRect = (rect: DOMRect, xInsetPercent: number, yInsetPercent: number) => {
      const xInset = rect.width * xInsetPercent;
      const yInset = rect.height * yInsetPercent;
      return {
        left: rect.left + xInset,
        right: rect.right - xInset,
        top: rect.top + yInset,
        bottom: rect.bottom - yInset,
      };
    };

    const titleCore = shrinkRect(titleRect, 0.18, 0.22);
    const jokerCore = shrinkRect(jokerRect, 0.2, 0.12);
    const geraltCore = shrinkRect(geraltRect, 0.2, 0.12);

    const expandRect = (
      rect: { left: number; right: number; top: number; bottom: number },
      xPad: number,
      yPad: number,
    ) => ({
      left: rect.left - xPad,
      right: rect.right + xPad,
      top: rect.top - yPad,
      bottom: rect.bottom + yPad,
    });

    const intersects = (
      a: { left: number; right: number; top: number; bottom: number },
      b: { left: number; right: number; top: number; bottom: number },
    ) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

    const enterTitleZone = expandRect(titleCore, 14, 10);
    const exitTitleZone = expandRect(titleCore, 32, 22);
    const zone = this.hideSideCharacters ? exitTitleZone : enterTitleZone;

    const jokerZone = expandRect(jokerCore, 10, 8);
    const geraltZone = expandRect(geraltCore, 10, 8);

    const shouldHide = intersects(jokerZone, zone) || intersects(geraltZone, zone);
    this.hideSideCharacters = shouldHide;
    if (shouldHide) {
      this.sideCharactersHideLocked = true;
    }
  }

  /** Alterna la visibilidad del desplegable de géneros. */
  toggleAllGenres(): void {
    if (this.showAllGenres) {
      this.closeGenreDropdown();
    } else {
      this.showAllGenres = true;
      this.isClosingGenreDropdown = false;
    }
  }

  /** Cierra el desplegable de géneros con animación. */
  closeGenreDropdown(): void {
    this.isClosingGenreDropdown = true;
    setTimeout(() => {
      this.showAllGenres = false;
      this.isClosingGenreDropdown = false;
    }, 150);
  }

  /**
   * Carga la lista de juegos y los clasifica en las diferentes secciones.
   * Incluye la carga de medios asociados a cada juego.
   */
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

  /** Navega a la página de detalle de un producto. */
  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  /** Navega a la página de búsqueda filtrando por género. */
  goToGenres(nombre: string) {
    this.router.navigate(['/search'], { queryParams: { genre: nombre } });
  }

  onGenreTiltEnter(key: string, el: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const state = this.ensureGenreTiltState(key, el);
    state.hoverTarget = 1;
    this.startGenreTiltAnimation(state);
  }

  onGenreTiltMove(event: MouseEvent, key: string, el: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (event.buttons === 1) return;
    const state = this.ensureGenreTiltState(key, el);
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    state.targetX = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    state.targetY = Math.max(-1, Math.min(1, (y - 0.5) * 2));
    this.startGenreTiltAnimation(state);
  }

  onGenreTiltLeave(key: string, el: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const state = this.ensureGenreTiltState(key, el);
    state.hoverTarget = 0;
    state.targetX = 0;
    state.targetY = 0;
    this.startGenreTiltAnimation(state);
  }

  private ensureGenreTiltState(key: string, el: HTMLElement) {
    const existing = this.genreTiltStates.get(key);
    if (existing) {
      existing.el = el;
      return existing;
    }
    const created = {
      el,
      rafId: null as number | null,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      hoverCurrent: 0,
      hoverTarget: 0,
    };
    this.genreTiltStates.set(key, created);
    return created;
  }

  private startGenreTiltAnimation(state: {
    el: HTMLElement;
    rafId: number | null;
    currentX: number;
    currentY: number;
    targetX: number;
    targetY: number;
    hoverCurrent: number;
    hoverTarget: number;
  }): void {
    if (state.rafId !== null) return;

    const smoothFactor = 0.18;
    const hoverSmoothFactor = 0.22;
    const stopThreshold = 0.001;

    const step = () => {
      const dx = state.targetX - state.currentX;
      const dy = state.targetY - state.currentY;
      const dh = state.hoverTarget - state.hoverCurrent;

      state.currentX += dx * smoothFactor;
      state.currentY += dy * smoothFactor;
      state.hoverCurrent += dh * hoverSmoothFactor;

      const rotateY = state.currentX * this.genreTiltMaxRotateDeg;
      const rotateX = -state.currentY * this.genreTiltMaxRotateDeg;
      const translateX = state.currentX * this.genreTiltMaxTranslatePx;
      const translateY = state.currentY * this.genreTiltMaxTranslatePx;
      const scale = 1 + state.hoverCurrent * 0.022;
      const shadowX = translateX;
      const shadowY = 3 + Math.max(translateY, 0) * 0.7;

      state.el.style.transform = `perspective(800px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${translateX}px, ${translateY}px)`;
      state.el.style.boxShadow = `${shadowX}px ${shadowY + 1}px 12px rgba(0,0,0,0.45)`;

      if (
        Math.abs(dx) < stopThreshold &&
        Math.abs(dy) < stopThreshold &&
        Math.abs(dh) < stopThreshold
      ) {
        state.rafId = null;
        state.currentX = state.targetX;
        state.currentY = state.targetY;
        state.hoverCurrent = state.hoverTarget;
        if (state.hoverTarget === 0 && state.targetX === 0 && state.targetY === 0) {
          state.el.style.transform =
            'perspective(800px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
          state.el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.45)';
        }
        return;
      }

      state.rafId = requestAnimationFrame(step);
    };

    state.rafId = requestAnimationFrame(step);
  }

  /** Crea una lista de juegos 'placeholder' para estados de carga. */
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
      stockPc: 0,
      stockPs5: 0,
      stockXboxX: 0,
      stockSwitch: 0,
      stockPs4: 0,
      stockXboxOne: 0,
      media: [],
    } as unknown as Game);
  }

  /** Escucha clics fuera para cerrar el menú de géneros. */
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
