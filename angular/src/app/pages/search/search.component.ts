import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/impl/game.service';
import { Game } from '../../core/models/game.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-search',
  imports: [RouterModule, TranslatePipe, CommonModule, GameCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  games: Game[] = [];
  filteredGames: Game[] = [];
  
  activeFilters: { type: string; value: string; label: string }[] = [];
  selectedPrice = '';
  selectedGenre = '';
  selectedPlatform = '';

  priceOptions: FilterOption[] = [];
  genreOptions: FilterOption[] = [];
  platformOptions: FilterOption[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      this.loadGames();
    });

    this.initializeFilterOptions();
  }

  initializeFilterOptions(): void {
    this.priceOptions = [
      { value: 'free', label: 'search.filters.price.free' },
      { value: '0-10', label: 'search.filters.price.under10' },
      { value: '10-20', label: 'search.filters.price.10to20' },
      { value: '20-40', label: 'search.filters.price.20to40' },
      { value: '40+', label: 'search.filters.price.over40' },
    ];

    this.genreOptions = [
      { value: 'action', label: 'genres.action' },
      { value: 'adventure', label: 'genres.adventure' },
      { value: 'rpg', label: 'genres.rpg' },
      { value: 'sports', label: 'genres.sports' },
      { value: 'strategy', label: 'genres.strategy' },
      { value: 'simulation', label: 'genres.simulation' },
      { value: 'horror', label: 'genres.horror' },
      { value: 'racing', label: 'genres.racing' },
    ];

    this.platformOptions = [
      { value: 'pc', label: 'search.filters.platform.pc' },
      { value: 'playstation4', label: 'search.filters.platform.playstation4' },
      { value: 'playstation5', label: 'search.filters.platform.playstation5' },
      { value: 'xboxone', label: 'search.filters.platform.xboxone' },
      { value: 'xboxX', label: 'search.filters.platform.xboxX' },
      { value: 'nintendoswitch', label: 'search.filters.platform.nintendoswitch' },
    ];
  }

  loadGames(): void {
    this.gameService.getAll({ include: 'genres,media,platforms' }).subscribe({
      next: (allGames) => {
        this.games = allGames as Game[];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading games:', err);
      },
    });
  }

  onPriceChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPrice = select.value;
    this.updateActiveFilters();
    this.applyFilters();
  }

  onGenreChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedGenre = select.value;
    this.updateActiveFilters();
    this.applyFilters();
  }

  onPlatformChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPlatform = select.value;
    this.updateActiveFilters();
    this.applyFilters();
  }

  updateActiveFilters(): void {
    this.activeFilters = [];

    if (this.selectedPrice) {
      const priceOption = this.priceOptions.find(
        (opt) => opt.value === this.selectedPrice
      );
      if (priceOption) {
        this.activeFilters.push({
          type: 'price',
          value: this.selectedPrice,
          label: priceOption.label,
        });
      }
    }

    if (this.selectedGenre) {
      const genreOption = this.genreOptions.find(
        (opt) => opt.value === this.selectedGenre
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
        (opt) => opt.value === this.selectedPlatform
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

  applyFilters(): void {
    let filtered = [...this.games];

    if (this.searchQuery) {
      filtered = filtered.filter((game) =>
        game.title?.toLowerCase().includes(this.searchQuery.toLowerCase())
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

  filterByPrice(games: Game[], priceRange: string): Game[] {
    if (priceRange === 'free') {
      return games.filter((game) => !game.price || game.price === 0);
    }

    if (priceRange === '40+') {
      return games.filter((game) => game.price && game.price >= 40);
    }

    const [min, max] = priceRange.split('-').map(Number);
    return games.filter(
      (game) => game.price && game.price >= min && game.price <= max
    );
  }

  filterByGenre(games: Game[], genreKey: string): Game[] {
    const genreTranslationMap: { [key: string]: string } = {
      action: 'Accion',
      adventure: 'Aventura',
      rpg: 'RPG',
      sports: 'Deportes',
      strategy: 'Estrategia',
      simulation: 'Simulacion',
      horror: 'Terror',
      racing: 'Carreras',
    };

    const genreName = genreTranslationMap[genreKey];
    return games.filter((game) =>
      game?.genres?.some((g) => g.name === genreName)
    );
  }

  filterByPlatform(games: Game[], platformKey: string): Game[] {
    return games.filter((game) =>
      game?.platforms?.some((p) =>
        p.name?.toLowerCase().includes(platformKey.toLowerCase())
      )
    );
  }

  removeFilter(filterType: string): void {
    if (filterType === 'price') {
      this.selectedPrice = '';
    } else if (filterType === 'genre') {
      this.selectedGenre = '';
    } else if (filterType === 'platform') {
      this.selectedPlatform = '';
    }
    this.updateActiveFilters();
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedPrice = '';
    this.selectedGenre = '';
    this.selectedPlatform = '';
    this.activeFilters = [];
    this.applyFilters();
  }

  getCoverUrl(game: Game): string {
    const coverImage = game.media?.find((m) =>
      m.altText?.toLowerCase().includes('cover')
    );
    return coverImage?.url || 'assets/images/placeholder.png';
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', id.toString()]);
  }
}
