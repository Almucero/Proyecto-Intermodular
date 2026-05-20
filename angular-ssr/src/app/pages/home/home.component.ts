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
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { GameService } from '../../core/services/impl/game.service';
import { MediaService } from '../../core/services/impl/media.service';
import { Game } from '../../core/models/game.model';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { UiStateService } from '../../core/services/ui-state.service';

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
  /** Propiedad no documentada. */
  @ViewChild('backgroundLayer') backgroundLayer!: ElementRef;
  /** Propiedad no documentada. */
  @ViewChild('jokerLayer') jokerLayer!: ElementRef;
  /** Propiedad no documentada. */
  @ViewChild('titleLayer') titleLayer!: ElementRef;
  /** Propiedad no documentada. */
  @ViewChild('geraltLayer') geraltLayer!: ElementRef;
  /** Propiedad no documentada. */
  @ViewChild('bottomLayer') bottomLayer!: ElementRef;
  /** Propiedad no documentada. */
  @ViewChild('mainContent') mainContent!: ElementRef;
  /** Contenedor de los géneros para cálculo de ancho. */
  @ViewChild('genresContainer') genresContainer!: ElementRef;

  /** Contenedor del desplegable para la máscara de scroll dinámico. */
  @ViewChild('dropdownScrollContainer') set dropdownScrollContainer(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      setTimeout(() => {
        this.updateScrollMask(el.nativeElement);
      }, 0);
    }
  }

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
  genreScrollState = {
    left: false,
    right: true,
  };

  @ViewChild('mobileGenresContainer') mobileGenresContainer?: ElementRef<HTMLDivElement>;

  updateGenreScrollState() {
    if (!isPlatformBrowser(this.platformId)) return;
    const element = this.mobileGenresContainer?.nativeElement;
    if (element) {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      this.genreScrollState.left = scrollLeft > 2;
      this.genreScrollState.right = scrollLeft < scrollWidth - clientWidth - 2;
      this.cdr.detectChanges();
    }
  }
  /** Propiedad no documentada. */
  hideSideCharacters = false;
  /** Propiedad no documentada. */
  sideCharactersVisibilityReady = false;

  /** Listas de juegos cargados para las diferentes secciones. */
  bestSellers: Game[] = [];
  /** Propiedad no documentada. */
  onSaleGames: Game[] = [];
  /** Propiedad no documentada. */
  topRatedGames: Game[] = [];

  /** Propiedad no documentada. */
  private router = inject(Router);
  /** Propiedad no documentada. */
  private platformId = inject(PLATFORM_ID);
  /** Servicio para gestionar el estado global de la UI. */
  public uiState = inject(UiStateService);



  /** Propiedad no documentada. */
  private targetScrollY = 0;
  /** Propiedad no documentada. */
  private lastTargetScrollY = 0;
  /** Propiedad no documentada. */
  private rafId: number | null = null;
  /** Propiedad no documentada. */
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
  /** Propiedad no documentada. */
  private genreTiltMaxRotateDeg = 5;
  /** Propiedad no documentada. */
  private genreTiltMaxTranslatePx = 3.5;
  /** Propiedad no documentada. */
  private current = {
    backgroundY: 0,
    bottomY: 0,
    mainContentY: 0,
    charactersY: 0,
    horizontalX: 0,
    blurBackground: 0,
    blurCharacters: 0,
  };
  /** Propiedad no documentada. */
  private overlapCheckFrame = 0;
  /** Propiedad no documentada. */
  private sideCharactersHideLocked = false;
  /** Propiedad no documentada. */
  private lastViewportKey = '';

  /** Estado de carga de los datos de la API. */
  private dataLoading = signal(true);
  /** Indica si el retardo mínimo de skeletons ha finalizado. */
  private minSkeletonDelayDone = signal(false);

  /** 
   * Señal manual que determina si los carruseles deben mostrar skeletons.
   * Inicializada en true para que el SSR siempre renderice skeletons.
   */
  carouselsLoading = signal(true);

  constructor(
    private gameService: GameService,
    private mediaService: MediaService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    if (isPlatformBrowser(this.platformId)) {
      if (this.uiState.loaderAnimationDone()) {
        // Navegación interna: el loader ya terminó, disparamos inmediatamente.
        this.startMinimumSkeletonDelay();
      } else {
        // Carga inicial: esperamos al evento global del loader.
        window.addEventListener('gamingsage-home-trigger', this.onLoaderFinished);
      }
    }
  }

  /** Callback para el evento nativo del loader. */
  private onLoaderFinished = () => {
    this.startMinimumSkeletonDelay();
  };

  /**
   * Inicia el retardo mínimo de visualización de skeletons.
   * Basado estrictamente en el evento de visibilidad post-loader.
   */
  private startMinimumSkeletonDelay() {
    if (!isPlatformBrowser(this.platformId) || this.skeletonDelayTimeoutId) return;

    this.ngZone.run(() => {
      this.carouselsLoading.set(true);
      this.minSkeletonDelayDone.set(false);
    });
    
    this.ngZone.runOutsideAngular(() => {
      this.skeletonDelayTimeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.minSkeletonDelayDone.set(true);
          this.skeletonDelayTimeoutId = null;
          
          // Solo quitamos los skeletons si los datos también han llegado
          if (!this.dataLoading()) {
            this.carouselsLoading.set(false);
          }
          this.cdr.detectChanges();
        });
      }, 1100); // 1.1s (Dashboard style) tras el loader
    });
  }

  /** ID del timeout para evitar ejecuciones duplicadas. */
  private skeletonDelayTimeoutId: any = null;

  /**
   * Inicializa el componente, configurando géneros y cargando los juegos.
   */
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.checkScreenSize();
    this.otherGenres = this.allGenres.filter(
      (genre) => !this.genres.some((g) => g.value === genre.value),
    );
    this.loadGames();

    if (isPlatformBrowser(this.platformId)) {
      this.targetScrollY = window.scrollY || 0;
    }
  }

  /** Método no documentado. */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      this.sideCharactersVisibilityReady = true;
      this.requestSideCharactersVisibilityCheck();
      this.calculateVisibleGenres();
      this.setupResizeObserver();
      this.updateGenreScrollState();
    });
    this.targetScrollY = window.scrollY || 0;
    this.lastTargetScrollY = this.targetScrollY;
    this.startParallaxLoop();
  }



  /** Escucha cambios en el tamaño de la ventana. */
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
    this.requestSideCharactersVisibilityCheck();
  }

  /** Método no documentado. */
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
    this.calculateVisibleGenres();
    if (this.isMobile) {
      setTimeout(() => this.updateGenreScrollState(), 0);
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else {
      this.startParallaxLoop();
    }
  }

  /** Número de géneros visibles calculados dinámicamente. */
  visibleCount = signal(8);

  /** Calcula cuántos géneros caben en una sola fila. */
  private calculateVisibleGenres() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Actualizamos la detección de móvil en cada cálculo para mayor precisión
    this.isMobile = window.innerWidth <= 768;

    if (this.isMobile) {
      this.visibleCount.set(3);
      this.cdr.detectChanges();
      return;
    }

    // En escritorio, usamos ResizeObserver para medir el contenedor real
    const container = this.genresContainer?.nativeElement;
    if (container) {
      // La flecha es absolute, solo reservamos el ancho que ocupa (~40px) como margen de seguridad
      const availableWidth = container.clientWidth - 44;
      if (availableWidth > 0) {
        const pillWidth = 145;
        const calculatedCount = Math.floor(availableWidth / pillWidth);
        let adjustedCount = calculatedCount;
        if (window.innerWidth > 768 && window.innerWidth < 1400) {
          adjustedCount = calculatedCount - 1;
        }
        const finalCount = Math.max(2, Math.min(adjustedCount, this.genres.length));

        if (this.visibleCount() !== finalCount) {
          this.visibleCount.set(finalCount);
          this.cdr.detectChanges();
        }
      }
    }
  }

  private resizeObserver: any;

  private setupResizeObserver() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.run(() => {
        this.calculateVisibleGenres();
      });
    });

    if (this.genresContainer) {
      this.resizeObserver.observe(this.genresContainer.nativeElement);
    }
  }

  /** Géneros visibles en la barra principal según el dispositivo. */
  get visibleGenres() {
    return this.genres.slice(0, this.visibleCount());
  }

  /** Elementos a mostrar en el desplegable de géneros. */
  get dropdownItems() {
    const hiddenMainGenres = this.genres.slice(this.visibleCount());
    return [...hiddenMainGenres, ...this.otherGenres];
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

  /** Método no documentado. */
  private startParallaxLoop() {
    if (this.isMobile) return;
    if (this.rafId !== null) return;
    this.ngZone.runOutsideAngular(() => {
      const tick = () => {
        this.rafId = requestAnimationFrame(tick);
        this.renderParallaxFrame();
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  /** Método no documentado. */
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
    if(
      scrollingUp &&
      Math.abs(backgroundTarget - this.current.backgroundY) > 240
    ) {
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

  /**
     * Método no documentado.
     * @param current Parámetro no documentado.
     * @param target Parámetro no documentado.
     * @param alpha Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  private lerp(current: number, target: number, alpha: number) {
    return current + (target - current) * alpha;
  }

  /** Método no documentado. */
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

  /** Método no documentado. */
  private refreshSideCharactersLockForViewport() {
    const viewportKey = `${window.innerWidth}x${window.innerHeight}`;
    if (viewportKey !== this.lastViewportKey) {
      this.lastViewportKey = viewportKey;
      this.sideCharactersHideLocked = false;
      this.hideSideCharacters = false;
    }
  }

  /** Método no documentado. */
  updateSideCharactersVisibility() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.jokerLayer || !this.geraltLayer || !this.titleLayer) return;
    this.refreshSideCharactersLockForViewport();

    if (this.sideCharactersHideLocked) {
      this.hideSideCharacters = true;
      return;
    }

    const titleRect = (
      this.titleLayer.nativeElement as HTMLElement
    ).getBoundingClientRect();
    const jokerRect = (
      this.jokerLayer.nativeElement as HTMLElement
    ).getBoundingClientRect();
    const geraltRect = (
      this.geraltLayer.nativeElement as HTMLElement
    ).getBoundingClientRect();

    if (
      titleRect.width <= 0 || titleRect.height <= 0 ||
      jokerRect.width <= 0 || jokerRect.height <= 0 ||
      geraltRect.width <= 0 || geraltRect.height <= 0
    ) {
      return;
    }

    const shrinkRect = (
      rect: DOMRect,
      xInsetPercent: number,
      yInsetPercent: number,
    ) => {
      const xInset = rect.width * xInsetPercent;
      const yInset = rect.height * yInsetPercent;
      return {
        left: rect.left + xInset,
        right: rect.right - xInset,
        top: rect.top + yInset,
        bottom: rect.bottom - yInset,
      };
    };

    const titleCore = shrinkRect(titleRect, 0.10, 0.15);
    const jokerCore = shrinkRect(jokerRect, 0.12, 0.10);
    const geraltCore = shrinkRect(geraltRect, 0.12, 0.10);

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
    ) =>
      !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
      );

    const enterTitleZone = expandRect(titleCore, 45, 25);
    const exitTitleZone = expandRect(titleCore, 70, 40);
    const zone = this.hideSideCharacters ? exitTitleZone : enterTitleZone;

    const jokerZone = expandRect(jokerCore, 15, 10);
    const geraltZone = expandRect(geraltCore, 15, 10);

    const shouldHide =
      intersects(jokerZone, zone) || intersects(geraltZone, zone);

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
   * Maneja el scroll en el desplegable de géneros para actualizar su máscara de difuminado.
   */
  onDropdownScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.updateScrollMask(target);
  }

  /**
   * Actualiza las variables CSS de máscara del desplegable según su estado de desplazamiento.
   */
  private updateScrollMask(el: HTMLElement) {
    if (!el) return;
    
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    
    const showTop = scrollTop > 5;
    const showBottom = scrollTop + clientHeight < scrollHeight - 5;
    
    el.style.setProperty('--scroll-top-mask', showTop ? '0' : '1');
    el.style.setProperty('--scroll-top-mask-stop', showTop ? '2rem' : '0px');
    el.style.setProperty('--scroll-bottom-mask', showBottom ? '0' : '1');
    el.style.setProperty('--scroll-bottom-mask-stop', showBottom ? 'calc(100% - 2rem)' : '100%');
  }

  /**
   * Carga la lista de juegos y los clasifica en las diferentes secciones.
   */
  loadGames() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Vaciado de seguridad
    this.bestSellers = [];
    this.onSaleGames = [];
    this.topRatedGames = [];
    this.dataLoading.set(true);

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

        this.dataLoading.set(false);
        // Si el temporizador de skeletons también terminó, ocultamos skeletons
        if (this.minSkeletonDelayDone()) {
          this.carouselsLoading.set(false);
        }
        this.cdr.detectChanges();
      });
    });
  }

  /**
     * Navega a la página de detalle de un producto.
     * @param id Parámetro no documentado.
     */
  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  /**
     * Navega a la página de búsqueda filtrando por género.
     * @param nombre Parámetro no documentado.
     */
  goToGenres(nombre: string) {
    this.router.navigate(['/search'], { queryParams: { genre: nombre } });
  }

  /**
     * Método no documentado.
     * @param key Parámetro no documentado.
     * @param el Parámetro no documentado.
     */
  onGenreTiltEnter(key: string, el: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const state = this.ensureGenreTiltState(key, el);
    state.hoverTarget = 1;
    this.startGenreTiltAnimation(state);
  }

  /**
     * Método no documentado.
     * @param event Parámetro no documentado.
     * @param key Parámetro no documentado.
     * @param el Parámetro no documentado.
     */
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

  /**
     * Método no documentado.
     * @param key Parámetro no documentado.
     * @param el Parámetro no documentado.
     */
  onGenreTiltLeave(key: string, el: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const state = this.ensureGenreTiltState(key, el);
    state.hoverTarget = 0;
    state.targetX = 0;
    state.targetY = 0;
    this.startGenreTiltAnimation(state);
  }

  /**
     * Método no documentado.
     * @param key Parámetro no documentado.
     * @param el Parámetro no documentado.
     * @returns Retorno no documentado.
     */
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

  /**
     * Método no documentado.
     * @param state Parámetro no documentado.
     */
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
        if (
          state.hoverTarget === 0 &&
          state.targetX === 0 &&
          state.targetY === 0
        ) {
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



  /**
     * Escucha clics fuera para cerrar el menú de géneros.
     * @param event Parámetro no documentado.
     */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      if (this.showAllGenres) {
        this.closeGenreDropdown();
      }
    }
  }

  /**
   * Formatea el nombre de un género para dispositivos móviles.
   * Si es un acrónimo (como RPG, TBS, RTS, MOBA, MMORPG, FPS, CCG), lo mantiene en mayúsculas.
   * Para otros géneros, capitaliza únicamente la primera letra.
   * @param translatedName Nombre traducido del género.
   * @returns Nombre formateado.
   */
  formatGenreName(translatedName: string): string {
    if (!translatedName) return '';
    const upper = translatedName.toUpperCase();
    const acronyms = ['RPG', 'TBS', 'RTS', 'MOBA', 'MMORPG', 'FPS', 'CCG'];
    if (acronyms.includes(upper)) {
      return upper;
    }
    const lower = translatedName.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  /**
   * Limpia recursos y suscripciones al destruir el componente.
   */
  ngOnDestroy(): void {
    // 0. Limpiar escuchador de eventos
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('gamingsage-home-trigger', this.onLoaderFinished);
    }

    // 1. Limpiar temporizador de skeletons
    if (this.skeletonDelayTimeoutId) {
      clearTimeout(this.skeletonDelayTimeoutId);
      this.skeletonDelayTimeoutId = null;
    }
    
    // 2. Limpiar animaciones de parallax
    if (this.rafId !== null && isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // 3. Limpiar observador de redimensionamiento
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // 4. Limpiar estados de tilt
    this.genreTiltStates.forEach((state) => {
      if (state.rafId) cancelAnimationFrame(state.rafId);
    });
    this.genreTiltStates.clear();
  }
}
