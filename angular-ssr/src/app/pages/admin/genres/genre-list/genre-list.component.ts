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
import { GenreService } from '../../../../core/services/impl/genre.service';
import { Genre } from '../../../../core/models/genre.model';
import { GenreFormComponent } from '../genre-form/genre-form.component';

/**
 * Componente que muestra la lista de géneros de videojuegos en el panel de administración.
 * Permite buscar, filtrar, editar y eliminar géneros de la base de datos.
 */
@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, GenreFormComponent, FormsModule],
  templateUrl: './genre-list.component.html',
  styleUrl: './genre-list.component.scss',
})
export class GenreListComponent implements OnInit {
  private genreService = inject(GenreService);
  private readonly MIN_SKELETON_MS = 550;

  /** Referencia al contenedor con scroll para efectos visuales de sombras. */
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  /** Lista completa de géneros. */
  genres: Genre[] = [];
  /** Lista de géneros que coinciden con el criterio de búsqueda. */
  filteredGenres: Genre[] = [];
  /** Término de búsqueda para filtrar géneros por nombre. */
  searchTerm: string = '';
  /** Controla la visibilidad del modal para añadir o editar un género. */
  showModal = false;
  /** ID del género seleccionado para su edición (null para creación). */
  selectedGenreId: number | null = null;
  /** Controla la visibilidad del modal de confirmación de borrado. */
  showDeleteModal = false;
  /** ID del género que se ha marcado para eliminar. */
  genreToDeleteId: number | null = null;
  /** Indica si los datos se están cargando actualmente. */
  isLoading = true;
  /** Indica si se debe mostrar la sombra superior en el listado. */
  showTopShadow = false;
  /** Indica si se debe mostrar la sombra inferior en el listado. */
  showBottomShadow = false;

  /**
   * Carga inicial de los géneros al activar el componente.
   */
  ngOnInit(): void {
    this.loadGenres();
  }

  /**
   * Obtiene todos los géneros desde el servicio y actualiza la vista.
   */
  loadGenres() {
    this.isLoading = true;
    const loadStartedAt = Date.now();
    this.genreService.getAll().subscribe((data) => {
      const elapsed = Date.now() - loadStartedAt;
      const remaining = Math.max(0, this.MIN_SKELETON_MS - elapsed);
      setTimeout(() => {
        this.genres = data;
        this.filterGenres();
        this.isLoading = false;
        setTimeout(() => {
          this.onScroll();
        }, 0);
      }, remaining);
    });
  }

  /**
   * Filtra la lista de géneros en base al término de búsqueda.
   */
  filterGenres() {
    if (!this.searchTerm) {
      this.filteredGenres = this.genres;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredGenres = this.genres.filter((g) =>
        g.name.toLowerCase().includes(lower),
      );
    }
    setTimeout(() => {
      this.onScroll();
    }, 0);
  }

  /**
   * Actualiza el estado de las sombras visuales basándose en el desplazamiento del scroll.
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

  /** Abre el modal para crear un género nuevo. */
  openCreateModal() {
    this.selectedGenreId = null;
    this.showModal = true;
  }

  /** Abre el modal para editar un género existente. */
  openEditModal(id: number) {
    this.selectedGenreId = id;
    this.showModal = true;
  }

  /** Cierra el modal de creación/edición de géneros. */
  closeModal() {
    this.showModal = false;
    this.selectedGenreId = null;
  }

  /** Callback ejecutado tras un guardado exitoso en el formulario. */
  onFormSave() {
    this.closeModal();
    this.loadGenres();
  }

  /** Abre el modal de confirmación para eliminar un género. */
  openDeleteModal(id: number) {
    this.genreToDeleteId = id;
    this.showDeleteModal = true;
  }

  /** Cierra el modal de confirmación de borrado. */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.genreToDeleteId = null;
  }

  /** Ejecuta el borrado del género tras la confirmación del usuario. */
  confirmDelete() {
    if (this.genreToDeleteId) {
      this.genreService
        .delete(this.genreToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadGenres();
        });
    }
  }
}
