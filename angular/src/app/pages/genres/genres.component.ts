import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/impl/game.service';
import { Game } from '../../core/models/game.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';

@Component({
  selector: 'app-genres',
  imports: [RouterModule, TranslatePipe, CommonModule, GameCardComponent],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss',
})
export class GenresComponent implements OnInit {
  genreName = '';
  games: Game[] = [];

  private genreTranslationMap: { [key: string]: string } = {
    action: 'Accion',
    adventure: 'Aventura',
    rpg: 'RPG',
    sports: 'Deportes',
    strategy: 'Estrategia',
    simulation: 'Simulacion',
    horror: 'Terror',
    racing: 'Carreras',
    platform: 'Plataformas',
    puzzle: 'Puzzles',
    fighting: 'Lucha',
    music: 'Musicales',
    'action-adventure': 'Acción-Aventura',
    shooter: 'Shooter',
    moba: 'MOBA',
    roguelike: 'Roguelike',
    sandbox: 'Sandbox',
    mmorpg: 'MMORPG',
    'battle-royale': 'Battle Royale',
    'survival-horror': 'Survival Horror',
    metroidvania: 'Metroidvania',
    rts: 'RTS',
    tbs: 'TBS',
    'hack-and-slash': 'Hack and Slash',
    'beat-em-up': "Beat 'Em Up",
    'visual-novel': 'Novela Visual',
    ccg: 'CCG',
    fps: 'FPS',
    tactical: 'Táctico',
    'sci-fi': 'Ciencia Ficción',
    educational: 'Educativo',
    management: 'Gestión',
    'city-building': 'Construcción de Ciudades',
    exploration: 'Exploración',
    survival: 'Supervivencia',
    'psychological-horror': 'Horror Psicológico',
    stealth: 'Stealth',
    cinematic: 'Cinemático',
    narrative: 'Narrativa',
    cooperative: 'Cooperativo',
    arcade: 'Arcade',
    'open-world': 'Mundo Abierto',
    'off-road': 'Off-Road',
    simcade: 'Simcade',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.genreName = this.route.snapshot.paramMap.get('nombre') || '';
    this.loadGames();
  }

  loadGames(): void {
    this.gameService.getAll({ include: 'genres,media' }).subscribe({
      next: (allGames) => {
        const genreKey = this.genreName.startsWith('genres.')
          ? this.genreName.substring(7)
          : this.genreName;
        const genreNameInSpanish =
          this.genreTranslationMap[genreKey.toLowerCase()];
        this.games = allGames.filter((game) =>
          game?.genres?.some((g) => g.name === genreNameInSpanish)
        ) as Game[];
      },
      error: (err) => {
        console.error('Error cargando juegos:', err);
      },
    });
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
