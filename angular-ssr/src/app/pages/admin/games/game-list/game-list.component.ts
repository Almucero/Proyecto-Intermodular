import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GameService } from '../../../../core/services/impl/game.service';
import { Game } from '../../../../core/models/game.model';
import { GameFormComponent } from '../game-form/game-form.component';

/**
 * Componente que muestra la lista de videojuegos en el panel de administración.
 * Permite buscar, filtrar, editar y eliminar juegos, así como abrir un modal
 * para la creación de nuevos registros.
 */
@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, GameFormComponent, FormsModule],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.scss',
})
export class GameListComponent implements OnInit {
  private gameService = inject(GameService);

  /** Referencia al contenedor con scroll para manejar efectos visuales de sombras. */
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  /** Lista completa de videojuegos. */
  games: Game[] = [];
  /** Lista de videojuegos filtrados por el término de búsqueda. */
  filteredGames: Game[] = [];
  /** Término de búsqueda introducido por el usuario. */
  searchTerm: string = '';
  /** Controla la visibilidad del modal de creación/edición. */
  showModal = false;
  /** Almacena el ID del juego seleccionado para edición (null si es creación). */
  selectedGameId: number | null = null;
  /** Controla la visibilidad del modal de confirmación de borrado. */
  showDeleteModal = false;
  /** Almacena el ID del juego que se pretende eliminar. */
  gameToDeleteId: number | null = null;
  /** Indica si la lista está en proceso de carga inicial. */
  isLoading = true;
  /** Indica si debe mostrarse la sombra superior (cuando hay scroll hacia abajo). */
  showTopShadow = false;
  /** Indica si debe mostrarse la sombra inferior (cuando no se ha llegado al final). */
  showBottomShadow = false;

  /**
   * Inicializa el componente cargando la lista de juegos.
   */
  ngOnInit(): void {
    this.loadGames();
  }

  /**
   * Obtiene todos los juegos del servidor y actualiza la lista.
   */
  loadGames() {
    this.isLoading = true;
    this.gameService.getAll().subscribe((data) => {
      this.games = data;
      this.filterGames();
      this.isLoading = false;
      setTimeout(() => {
        this.onScroll();
      }, 0);
    });
  }

  /**
   * Filtra los juegos localmente basándose en el término de búsqueda por título.
   */
  filterGames() {
    if (!this.searchTerm) {
      this.filteredGames = this.games;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredGames = this.games.filter((g) =>
        g.title.toLowerCase().includes(lower),
      );
    }
    setTimeout(() => {
      this.onScroll();
    }, 0);
  }

  /**
   * Maneja el evento de scroll para actualizar la visibilidad de las sombras superior e inferior.
   */
  onScroll() {
    if (!this.scrollContainer) return;
    const element = this.scrollContainer.nativeElement;
    this.showTopShadow = element.scrollTop > 0;
    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    this.showBottomShadow =
      !atBottom && element.scrollHeight > element.clientHeight;
  }

  /** Abre el modal para crear un nuevo videojuego. */
  openCreateModal() {
    this.selectedGameId = null;
    this.showModal = true;
  }

  /** Abre el modal para editar un videojuego existente. */
  openEditModal(id: number) {
    this.selectedGameId = id;
    this.showModal = true;
  }

  /** Cierra el modal de creación/edición. */
  closeModal() {
    this.showModal = false;
    this.selectedGameId = null;
  }

  /** Se ejecuta cuando el formulario de guardado finaliza con éxito. */
  onFormSave() {
    this.closeModal();
    this.loadGames();
  }

  /** Abre el modal de confirmación para eliminar un juego. */
  openDeleteModal(id: number) {
    this.gameToDeleteId = id;
    this.showDeleteModal = true;
  }

  /** Cierra el modal de confirmación de borrado. */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.gameToDeleteId = null;
  }

  /** Ejecuta el borrado definitivo del juego tras la confirmación. */
  confirmDelete() {
    if (this.gameToDeleteId) {
      this.gameService.delete(this.gameToDeleteId.toString()).subscribe(() => {
        this.closeDeleteModal();
        this.loadGames();
      });
    }
  }
}
