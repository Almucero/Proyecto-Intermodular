import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
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
} from '@angular/animations';

interface FilterOption {
  value: string;
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
        style({ maxHeight: '0px', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ maxHeight: '1000px', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ maxHeight: '1000px', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-out', style({ maxHeight: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class SearchComponent implements OnInit {
  /** Consulta de búsqueda textual actual. */
  searchQuery = '';
  /** Lista completa de juegos cargados. */
  games: Game[] = [];
  /** Lista de juegos que cumplen con los filtros aplicados. */
  filteredGames: Game[] = [];

  /** Filtros activos seleccionados por el usuario para mostrar como etiquetas (chips). */
  activeFilters: { type: string; value: string; label: string }[] = [];
  /** Filtro de precio seleccionado (ej: '0-20', 'free', '40+'). */
  selectedPrice = '';
  /** Filtro de género seleccionado. */
  selectedGenre = '';
  /** Filtro de plataforma seleccionado. */
  selectedPlatform = '';

  /** Valores para el control deslizante (slider) de precio. */
  minPrice = 0;
  maxPrice = 100;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private platformService: PlatformService,
    private currencyService: CurrencyService,
  ) {}

  /**
   * Inicializa el componente configurando las opciones de filtrado
   * y suscribiéndose a los parámetros de la URL.
   */
  ngOnInit(): void {
    this.filteredGames = this.createPlaceholders();

    this.initializeFilterOptions();

    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      this.selectedGenre = params['genre'] || '';
      this.selectedPrice = params['price'] || '';
      this.selectedPlatform = params['platform'] || '';

      this.updateActiveFilters();
      this.loadGames();
    });
  }

  /** Crea una lista de juegos 'placeholder' para mostrar durante la carga. */
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
      { value: 'Estrategia', key: 'genres.strategy' }, // Nota: Se mantuvo 'key' por compatibilidad si existe, pero el modelo usa 'label'
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
    ] as any; // Cast temporal para evitar errores con 'key' vs 'label'

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
      error: () => {},
    });
  }

  /**
   * Solicita todos los juegos al servicio y aplica los filtros actuales.
   * También calcula el rango máximo de precio basado en los juegos recibidos.
   */
  loadGames(): void {
    this.gameService.getAll({ include: 'genres,media,platforms' }).subscribe({
      next: (allGames) => {
        this.games = allGames as Game[];
        const maxGamePrice = Math.max(
          ...this.games.map((g) => {
            return g.isOnSale &&
              g.salePrice !== null &&
              g.salePrice !== undefined
              ? Number(g.salePrice)
              : Number(g.price) || 0;
          }),
        );
        this.maxPrice = Math.ceil(maxGamePrice / 10) * 10;
        if (this.maxPrice === 0) this.maxPrice = 100;
        this.priceValue = this.maxPrice;

        this.applyFilters();
      },
      error: (err) => {
      },
    });
  }

  /** Maneja el cambio manual en el selector de precio. */
  onPriceChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPrice = select.value;
    this.updateActiveFilters();
    this.applyFilters();
  }

  /** Maneja el cambio en el control deslizante de precio. */
  onPriceSliderChange(): void {
    this.selectedPrice = `0-${this.priceValue}`;
    this.updateActiveFilters();
    this.applyFilters();
  }

  /** Maneja el cambio en el filtro de género. */
  onGenreChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedGenre = select.value;
    this.updateActiveFilters();
    this.applyFilters();
  }

  /** Maneja el cambio en el filtro de plataforma. */
  onPlatformChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPlatform = select.value;
    this.updateActiveFilters();
    this.applyFilters();
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

    if (this.selectedGenre) {
      const genreOption = this.genreOptions.find(
        (opt) => opt.value === this.selectedGenre,
      );
      if (genreOption) {
        this.activeFilters.push({
          type: 'genre',
          value: this.selectedGenre,
          label: genreOption.label,
        });
      }
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

    let filtered = [...this.games];

    if (this.searchQuery) {
      filtered = filtered.filter((game) =>
        game.title?.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    }

    if (this.selectedPrice) {
      filtered = this.filterByPrice(filtered, this.selectedPrice);
    }

    if (this.selectedGenre) {
      filtered = this.filterByGenre(filtered, this.selectedGenre);
    }

    if (this.selectedPlatform) {
      filtered = this.filterByPlatform(filtered, this.selectedPlatform);
    }

    this.filteredGames = filtered;
  }

  /** Filtra una lista de juegos por un rango o tipo de precio. */
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

  /** Filtra una lista de juegos por género. */
  filterByGenre(games: Game[], genreKey: string): Game[] {
    return games.filter((game) =>
      game?.genres?.some(
        (g) => g.name?.toLowerCase() === genreKey.toLowerCase(),
      ),
    );
  }

  /** Filtra una lista de juegos por plataforma. */
  filterByPlatform(games: Game[], platformKey: string): Game[] {
    return games.filter((game) =>
      game?.platforms?.some((p) =>
        p.name?.toLowerCase().includes(platformKey.toLowerCase()),
      ),
    );
  }

  /** Elimina un filtro específico por su tipo. */
  removeFilter(filterType: string): void {
    if (filterType === 'price') {
      this.selectedPrice = '';
      this.priceValue = this.maxPrice;
    } else if (filterType === 'genre') {
      this.selectedGenre = '';
    } else if (filterType === 'platform') {
      this.selectedPlatform = '';
    }
    this.updateActiveFilters();
    this.applyFilters();
  }

  /** Restablece todos los filtros a su estado inicial. */
  resetFilters(): void {
    this.selectedPrice = '';
    this.selectedGenre = '';
    this.selectedPlatform = '';
    this.priceValue = this.maxPrice;
    this.activeFilters = [];
    this.applyFilters();
  }

  /** Alterna la expansión de una sección de filtros en la UI. */
  toggleFilter(filterName: string): void {
    // eslint-disable-next-line security/detect-object-injection
    if (this.filtersExpanded[filterName] !== undefined) {
      // eslint-disable-next-line security/detect-object-injection
      this.filtersExpanded[filterName] = !this.filtersExpanded[filterName];
    }
  }

  /** Obtiene la URL de la portada de un juego o un placeholder si no tiene. */
  getCoverUrl(game: Game): string {
    const coverImage = game.media?.find((m) =>
      m.altText?.toLowerCase().includes('cover'),
    );
    return coverImage?.url || 'assets/images/ui/placeholder.webp';
  }

  /** Navega a la página de detalle de un producto. */
  goToProduct(id: number): void {
    this.router.navigate(['/product', id.toString()]);
  }

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
}
