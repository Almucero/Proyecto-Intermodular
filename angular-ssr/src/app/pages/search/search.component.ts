import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, PLATFORM_ID, NgZone, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UiStateService } from '../../core/services/ui-state.service';
import { GameService } from '../../core/services/impl/game.service';
import { PlatformService } from '../../core/services/impl/platform.service';
import { Game } from '../../core/models/game.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../core/services/currency.service';

import {
  trigger,
  state,
  style,
  transition,
  animate,
  group,
} from '@angular/animations';

/** Opción de selección para filtros de búsqueda en UI. */
interface FilterOption {
  /** Propiedad no documentada. */
  value: string;
  /** Propiedad no documentada. */
  label: string;
}

/**
 * Componente de la página de búsqueda de juegos.
 * Permite filtrar por texto, rango de precio, género y plataforma.
 * Incluye animaciones para la expansión/colapso de las secciones de filtros.
 */
@Component({
  selector: 'app-search',
  imports: [
    RouterModule,
    TranslatePipe,
    CommonModule,
    GameCardComponent,
    FormsModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('200ms ease-in-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in-out', style({ height: '0px', opacity: 0 }))
      ])
    ]),
  ],
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private uiState = inject(UiStateService);
  private ngZone = inject(NgZone);
  private minSkeletonDelayDone = signal(false);
  private skeletonDelayTimeoutId: any = null;
  @ViewChild('resultsScroller') resultsScroller!: ElementRef<HTMLElement>;
  @ViewChild('filtersScroller') filtersScroller!: ElementRef<HTMLElement>;

  /** Consulta de búsqueda textual actual. */
  searchQuery = '';
  /** Indica si se están cargando los filtros o datos iniciales. */
  isLoadingFilters = true;
  /** Timeout para la animación de carga de filtros. */
  private filterTimeout: any;
  /** Indica si se ha completado al menos una carga inicial. */
  hasLoadedOnce = false;
  /** Lista completa de juegos cargados. */
  games: Game[] = [];
  /** Lista de juegos que cumplen con los filtros aplicados. */
  filteredGames: Game[] = [];

  /** Filtros activos seleccionados por el usuario para mostrar como etiquetas (chips). */
  activeFilters: { type: string; value: string; label: string }[] = [];
  /** Indica si se están limpiando los filtros actualmente. */
  isClearingFilters = false;
  /** Indica si es la primera vez que se cargan los juegos. */
  isInitialLoad = true;
  /** Controla el tipo de carga a mostrar. */
  loadingType: 'skeletons' | 'spinner' | 'none' = 'skeletons';
  /** Lista de skeletons para el estado de carga. */
  skeletons: Game[] = [];
  /** Última consulta de búsqueda para detectar cambios de texto puro. */
  private lastSearchQuery = '';
  /** Habilita las transiciones CSS tras la hidratación completa. */
  viewReady = false;


  /** Filtro de precio seleccionado (ej: '0-20', 'free', '40+'). */
  selectedPrice = '';
  /** Filtro de género seleccionado (múltiple). */
  selectedGenres: string[] = [];
  /** Filtro de plataforma seleccionado. */
  selectedPlatform = '';

  /** Valores para el control deslizante (slider) de precio. */
  minPrice = 0;
  /** Propiedad no documentada. */
  maxPrice = 100;
  /** Propiedad no documentada. */
  priceValue = 100;

  /** Estado de expansión de los grupos de filtros en la barra lateral. */
  filtersExpanded: { [key: string]: boolean } = {
    price: false,
    genre: false,
    platform: false,
  };

  /** Opciones disponibles para los desplegables de filtros. */
  priceOptions: FilterOption[] = [];
  genreOptions: FilterOption[] = [];
  platformOptions: FilterOption[] = [];

  /**
     * Constructor no documentado.
     * @param route Parámetro no documentado.
     * @param router Parámetro no documentado.
     * @param gameService Parámetro no documentado.
     * @param platformService Parámetro no documentado.
     * @param currencyService Parámetro no documentado.
     */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private platformService: PlatformService,
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      if (this.uiState.loaderAnimationDone()) {
        this.startMinimumSkeletonDelay();
      } else {
        window.addEventListener('gamingsage-home-trigger', this.onLoaderFinished);
      }
    }
  }

  private onLoaderFinished = () => {
    this.startMinimumSkeletonDelay();
  };

  private startMinimumSkeletonDelay() {
    if (!isPlatformBrowser(this.platformId) || this.skeletonDelayTimeoutId) return;

    this.ngZone.run(() => {
      this.isLoadingFilters = true;
      this.minSkeletonDelayDone.set(false);
    });

    this.ngZone.runOutsideAngular(() => {
      this.skeletonDelayTimeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.minSkeletonDelayDone.set(true);
          this.skeletonDelayTimeoutId = null;

          if (this.hasLoadedOnce) {
            this.isLoadingFilters = false;
            this.loadingType = 'none';
          }
          this.cdr.detectChanges();
        });
      }, 1100);
    });
  }

  /**
   * Inicializa el componente configurando las opciones de filtrado
   * y suscribiéndose a los parámetros de la URL.
   */
  ngOnInit(): void {
    this.skeletons = this.createPlaceholders().slice(0, 32);
    this.filteredGames = this.createPlaceholders();

    this.initializeFilterOptions();

    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      
      // Si es la carga inicial y hay una búsqueda, usamos spinner en vez de skeletons
      if (!this.hasLoadedOnce && this.searchQuery) {
        this.loadingType = 'spinner';
      }
      
      const genreParam = params['genre'];
      if (genreParam) {
        this.selectedGenres = Array.isArray(genreParam) ? genreParam : genreParam.split(',');
      } else {
        this.selectedGenres = [];
      }
      
      this.selectedPrice = params['price'] || '';
      this.selectedPlatform = params['platform'] || '';

      this.updateActiveFilters();
      this.loadGames();
    });
  }

  /**
     * Crea una lista de juegos 'placeholder' para mostrar durante la carga.
     * @returns Retorno no documentado.
     */
  createPlaceholders(): Game[] {
    return Array(40).fill({
      id: -1,
      title: '...',
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

  /** Define las opciones estáticas para los filtros de precio, género y plataforma. */
  initializeFilterOptions(): void {
    this.priceOptions = [
      { value: 'free', label: 'search.filters.price.free' },
      { value: '0-10', label: 'search.filters.price.under10' },
      { value: '10-20', label: 'search.filters.price.10to20' },
      { value: '20-40', label: 'search.filters.price.20to40' },
      { value: '40+', label: 'search.filters.price.over40' },
    ];

    this.genreOptions = [
      { value: 'Accion', label: 'genres.action' },
      { value: 'Aventura', label: 'genres.adventure' },
      { value: 'RPG', label: 'genres.rpg' },
      { value: 'Deportes', label: 'genres.sports' },
      { value: 'Estrategia', label: 'genres.strategy' },
      { value: 'Simulacion', label: 'genres.simulation' },
      { value: 'Terror', label: 'genres.horror' },
      { value: 'Carreras', label: 'genres.racing' },
      { value: 'Sandbox', label: 'genres.sandbox' },
      { value: 'TBS', label: 'genres.tbs' },
      { value: 'Shooter', label: 'genres.shooter' },
      { value: 'Acción-Aventura', label: 'genres.action-adventure' },
      { value: 'RTS', label: 'genres.rts' },
      { value: 'Ciencia Ficción', label: 'genres.sci-fi' },
      { value: 'Gestión', label: 'genres.management' },
      { value: 'Construcción de Ciudades', label: 'genres.city-building' },
      { value: 'Exploración', label: 'genres.exploration' },
      { value: 'Supervivencia', label: 'genres.survival' },
      { value: 'Survival Horror', label: 'genres.survival-horror' },
      { value: 'Educativo', label: 'genres.educational' },
    ];

    this.platformOptions = [
      { value: 'PC', label: 'PC' },
      { value: 'PS5', label: 'PS5' },
      { value: 'Xbox Series X', label: 'Xbox Series X' },
      { value: 'Switch', label: 'Switch' },
      { value: 'PS4', label: 'PS4' },
      { value: 'Xbox One', label: 'Xbox One' },
    ];
  }

  /** Carga las plataformas desde el servicio (actualmente usa las estáticas). */
  loadPlatforms(): void {
    this.platformService.getAll().subscribe({
      next: (platforms) => {
        this.platformOptions = platforms.map((p) => ({
          value: p.name,
          label: p.name,
        }));
      },
      error: () => { },
    });
  }

  /**
   * Solicita todos los juegos al servicio y aplica los filtros actuales.
   * También calcula el rango máximo de precio basado en los juegos recibidos.
   */
  loadGames(): void {
    // Si ya tenemos juegos, no volvemos a pedir al servidor al cambiar filtros
    if (this.games.length > 0) {
      this.applyFilters();
      return;
    }

    this.gameService.getAll({ include: 'genres,media,platforms' }).subscribe({
      next: (allGames) => {
        this.games = allGames as Game[];
        const maxGamePrice = Math.max(
          ...this.games.map((g) => {
            const price = g.isOnSale && g.salePrice !== null && g.salePrice !== undefined
              ? Number(g.salePrice)
              : Number(g.price) || 0;
            return price;
          }),
        );
        this.maxPrice = Math.ceil(maxGamePrice / 10) * 10;
        if (this.maxPrice === 0) this.maxPrice = 100;

        this.updateActiveFilters();
        
        // Carga inicial: Skeletons solo si no hay búsqueda activa
        if (!this.searchQuery) {
          this.loadingType = 'skeletons';
        }
        
        this.applyFiltersInternal();
        this.isInitialLoad = false;
        this.hasLoadedOnce = true;
        this.lastSearchQuery = this.searchQuery;

        if (this.minSkeletonDelayDone()) {
          this.isLoadingFilters = false;
          this.loadingType = 'none';
        }
        
        this.cdr.detectChanges();
        this.updateAllScrollMasks();
      },
      error: () => {
        this.isLoadingFilters = false;
        this.isInitialLoad = false;
        this.loadingType = 'none';
        this.hasLoadedOnce = true;
      },
    });
  }

  /**
   * Maneja el cambio manual en el selector de precio.
   * @param event Evento de cambio del selector.
   */
  onPriceChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPrice = select.value;
    this.updateActiveFilters();
    this.applyFilters();
  }

  /** Maneja el cambio en el control deslizante de precio. */
  onPriceSliderChange(): void {
    this.selectedPrice = `0-${this.priceValue}`;
    this.syncFiltersToUrl();
  }


  /**
   * Maneja el cambio en el filtro de plataforma.
   * @param event Evento de cambio del selector.
   */
  onPlatformChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPlatform = select.value;
    this.syncFiltersToUrl();
  }

  /**
   * Actualiza la lista de etiquetas de filtros activos para la interfaz.
   */
  updateActiveFilters(): void {
    this.activeFilters = [];

    if (this.selectedPrice) {
      if (
        this.selectedPrice.startsWith('0-') &&
        !this.priceOptions.find((o) => o.value === this.selectedPrice)
      ) {
        this.activeFilters.push({
          type: 'price',
          value: this.selectedPrice,
          label: `Max: ${this.formatPrice(this.priceValue)}`,
        });
      } else {
        const priceOption = this.priceOptions.find(
          (opt) => opt.value === this.selectedPrice,
        );
        if (priceOption) {
          this.activeFilters.push({
            type: 'price',
            value: this.selectedPrice,
            label: priceOption.label,
          });
        }
      }
    }

    if (this.selectedGenres.length > 0) {
      this.selectedGenres.forEach(genre => {
        const genreOption = this.genreOptions.find((opt) => opt.value === genre);
        if (genreOption) {
          this.activeFilters.push({
            type: 'genre:' + genre,
            value: genre,
            label: genreOption.label,
          });
        }
      });
    }

    if (this.selectedPlatform) {
      const platformOption = this.platformOptions.find(
        (opt) => opt.value === this.selectedPlatform,
      );
      if (platformOption) {
        this.activeFilters.push({
          type: 'platform',
          value: this.selectedPlatform,
          label: platformOption.label,
        });
      }
    }

    if (this.searchQuery.trim()) {
      this.activeFilters.push({
        type: 'search',
        value: this.searchQuery,
        label: this.searchQuery,
      });
    }
  }

  /**
   * Ejecuta la lógica de filtrado sobre la lista completa de juegos
   * basándose en todos los criterios seleccionados.
   */
  applyFilters(): void {
    if (this.games.length === 0) {
      this.filteredGames = this.createPlaceholders();
      return;
    }

    // Detectar si SOLO ha cambiado el texto de búsqueda
    // Si no hay loaders activos y el cambio es solo texto, actualizamos instantáneamente
    const isOnlyTextChange = this.searchQuery !== this.lastSearchQuery && !this.isLoadingFilters;
    
    if (isOnlyTextChange) {
      this.applyFiltersInternal();
      this.lastSearchQuery = this.searchQuery;
      this.cdr.detectChanges();
      setTimeout(() => this.updateAllScrollMasks(), 50);
      return;
    }

    this.isLoadingFilters = true;

    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    // Un "reset" total es cuando no hay nada seleccionado ni escrito
    const hasActivePrice = !!this.selectedPrice && !(this.selectedPrice.startsWith('0-') && this.priceValue === this.maxPrice);
    const hasAnyFilter = this.selectedGenres.length > 0 || !!this.selectedPlatform || hasActivePrice || !!this.searchQuery.trim();
    const isFullReset = !hasAnyFilter;
    
    // Decidir qué mostrar
    if (this.isInitialLoad || isFullReset) {
      this.loadingType = 'skeletons';
    } else {
      this.loadingType = 'spinner';
    }

    this.cdr.detectChanges();

    const delay = this.loadingType === 'skeletons' ? 1200 : 1500;

    this.filterTimeout = setTimeout(() => {
      this.applyFiltersInternal();
      this.isLoadingFilters = false;
      this.loadingType = 'none';
      this.hasLoadedOnce = true;
      this.lastSearchQuery = this.searchQuery;
      this.cdr.detectChanges();
      setTimeout(() => this.updateAllScrollMasks(), 100);
    }, delay);
  }

  /**
   * Lógica interna de filtrado sin delays.
   */
  private applyFiltersInternal(): void {
    let filtered = [...this.games];

    if (this.searchQuery) {
      filtered = filtered.filter((game) =>
        game.title?.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    }

    if (this.selectedPrice) {
      filtered = this.filterByPrice(filtered, this.selectedPrice);
    }

    if (this.selectedGenres.length > 0) {
      filtered = this.filterByGenre(filtered, this.selectedGenres);
    }

    if (this.selectedPlatform) {
      filtered = this.filterByPlatform(filtered, this.selectedPlatform);
    }

    this.filteredGames = filtered;
  }

  /**
   * Filtra una lista de juegos por un rango o tipo de precio.
   * @param games Lista de juegos a filtrar.
   * @param priceRange Rango de precio seleccionado.
   * @returns Lista de juegos filtrados.
   */
  filterByPrice(games: Game[], priceRange: string): Game[] {
    if (priceRange === 'free') {
      return games.filter((game) => !game.price || game.price === 0);
    }

    if (priceRange === '40+') {
      return games.filter((game) => game.price && game.price >= 40);
    }

    const [min, max] = priceRange.split('-').map(Number);
    return games.filter((game) => {
      const effectivePrice =
        game.isOnSale && game.salePrice !== null && game.salePrice !== undefined
          ? Number(game.salePrice)
          : Number(game.price) || 0;

      const result = effectivePrice >= min && effectivePrice <= max;
      return result;
    });
  }

  /**
   * Filtra una lista de juegos por género.
   * @param games Lista de juegos a filtrar.
   * @param genres Lista de géneros seleccionados.
   * @returns Lista de juegos filtrados.
   */
  filterByGenre(games: Game[], genres: string[]): Game[] {
    if (!genres || genres.length === 0) return games;
    return games.filter((game) =>
      genres.some(genreKey => 
        game?.genres?.some((g) => g.name?.toLowerCase() === genreKey.toLowerCase())
      )
    );
  }

  /**
   * Filtra una lista de juegos por plataforma.
   * @param games Lista de juegos a filtrar.
   * @param platformKey Plataforma seleccionada.
   * @returns Lista de juegos filtrados.
   */
  filterByPlatform(games: Game[], platformKey: string): Game[] {
    return games.filter((game) =>
      game?.platforms?.some((p) =>
        p.name?.toLowerCase().includes(platformKey.toLowerCase()),
      ),
    );
  }

  /**
   * Elimina un filtro específico por su tipo.
   * @param type Tipo de filtro a eliminar.
   */
  removeFilter(type: string): void {
    if (this.activeFilters.length === 1 && this.activeFilters[0].type === type) {
      this.resetFilters();
      return;
    }
    
    if (type.startsWith('genre:')) {
      const genreValue = type.split(':')[1];
      this.selectedGenres = this.selectedGenres.filter((g) => g !== genreValue);
    } else {
      switch (type) {
        case 'price':
          this.priceValue = this.maxPrice;
          this.selectedPrice = '';
          break;
        case 'platform':
          this.selectedPlatform = '';
          break;
        case 'search':
          this.searchQuery = '';
          break;
      }
    }
    this.syncFiltersToUrl();
  }

  /** Sincroniza el estado de los filtros con los parámetros de la URL. */
  private syncFiltersToUrl(): void {
    const queryParams: any = {};
    if (this.searchQuery.trim()) queryParams.q = this.searchQuery;
    if (this.selectedGenres.length > 0) queryParams.genre = this.selectedGenres.join(',');
    if (this.selectedPrice) queryParams.price = this.selectedPrice;
    if (this.selectedPlatform) queryParams.platform = this.selectedPlatform;

    this.router.navigate(['/search'], {
      queryParams,
      replaceUrl: true
    });
  }

  /** Restablece todos los filtros a su estado inicial. */
  resetFilters() {
    this.isClearingFilters = true;
    
    // Limpiar datos inmediatamente
    this.searchQuery = '';
    this.selectedGenres = [];
    this.selectedPlatform = '';
    this.priceValue = this.maxPrice;
    this.selectedPrice = '';
    this.activeFilters = [];
    this.hasLoadedOnce = false;

    // Forzar estado de carga con skeletons
    this.isLoadingFilters = true; 
    this.loadingType = 'skeletons';
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.isClearingFilters = false;
      this.syncFiltersToUrl();
    }, 200);
  }

  /**
   * Alterna la expansión de una sección de filtros en la UI.
   * @param filterName Nombre del grupo de filtros a alternar.
   */
  toggleFilter(filterName: string): void {
    if (this.filtersExpanded[filterName] !== undefined) {
      this.filtersExpanded[filterName] = !this.filtersExpanded[filterName];
      
      // Recalcular máscaras tras la animación de expansión/colapso
      setTimeout(() => this.updateAllScrollMasks(), 50);
      setTimeout(() => this.updateAllScrollMasks(), 300);
    }
  }

  /**
   * Alterna la selección de un género.
   */
  toggleGenre(genreValue: string): void {
    const isRemoving = this.selectedGenres.includes(genreValue);
    if (isRemoving && this.activeFilters.length === 1) {
      this.resetFilters();
      return;
    }

    if (isRemoving) {
      this.selectedGenres = this.selectedGenres.filter((g) => g !== genreValue);
    } else {
      this.selectedGenres.push(genreValue);
    }
    this.syncFiltersToUrl();
  }

  /**
   * Alterna la selección de un precio.
   */
  togglePrice(priceValue: string): void {
    if (this.selectedPrice === priceValue) {
      if (this.activeFilters.length === 1) {
        this.resetFilters();
        return;
      }
      this.selectedPrice = '';
      this.priceValue = this.maxPrice;
    } else {
      this.selectedPrice = priceValue;
    }
    this.syncFiltersToUrl();
  }

  /**
   * Alterna la selección de una plataforma.
   */
  togglePlatform(platformValue: string): void {
    if (this.selectedPlatform === platformValue) {
      if (this.activeFilters.length === 1) {
        this.resetFilters();
        return;
      }
      this.selectedPlatform = '';
    } else {
      this.selectedPlatform = platformValue;
    }
    this.syncFiltersToUrl();
  }

  /**
   * Obtiene la URL de la portada de un juego o un placeholder si no tiene.
   * @param game Objeto del juego.
   * @returns URL de la imagen.
   */
  getCoverUrl(game: Game): string {
    const coverImage = game.media?.find((m) =>
      m.altText?.toLowerCase().includes('cover'),
    );
    return coverImage?.url || 'assets/images/ui/placeholder.webp';
  }

  /**
   * Navega a la página de detalle de un producto.
   * @param id Identificador del juego.
   */
  goToProduct(id: number): void {
    this.router.navigate(['/product', id.toString()]);
  }

  /**
   * Formatea un valor numérico a moneda local.
   * @param value Valor numérico.
   * @returns Precio formateado como string.
   */
  formatPrice(value: number): string {
    const converted = this.currencyService.convertFromEur(value);
    const code = this.currencyService.getCurrencyCode();
    const locale = this.currencyService.getLocaleCode();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.viewReady = true;
      this.cdr.detectChanges();
    }, 0);
    this.updateAllScrollMasks();
    setTimeout(() => this.updateAllScrollMasks(), 500);
    setTimeout(() => this.updateAllScrollMasks(), 2000);
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.updateScrollMask(target);
  }

  /**
   * Actualiza las variables CSS de máscara para un elemento específico.
   */
  private updateScrollMask(el: HTMLElement) {
    if (!el) return;
    
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    
    // Umbral de 5px para evitar parpadeos
    const showTop = scrollTop > 5;
    const showBottom = scrollTop + clientHeight < scrollHeight - 5;
    
    el.style.setProperty('--scroll-top-mask', showTop ? '0' : '1');
    el.style.setProperty('--scroll-top-mask-stop', showTop ? '2rem' : '0px');
    el.style.setProperty('--scroll-bottom-mask', showBottom ? '0' : '1');
    el.style.setProperty('--scroll-bottom-mask-stop', showBottom ? 'calc(100% - 2rem)' : '100%');
  }

  /**
   * Fuerza la actualización de máscaras en ambos contenedores.
   */
  private updateAllScrollMasks() {
    if (this.resultsScroller) this.updateScrollMask(this.resultsScroller.nativeElement);
    if (this.filtersScroller) this.updateScrollMask(this.filtersScroller.nativeElement);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('gamingsage-home-trigger', this.onLoaderFinished);
    }
    if (this.skeletonDelayTimeoutId) {
      clearTimeout(this.skeletonDelayTimeoutId);
    }
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
  }
}
