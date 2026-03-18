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
import { DeveloperService } from '../../../../core/services/impl/developer.service';
import { Developer } from '../../../../core/models/developer.model';
import { DeveloperFormComponent } from '../developer-form/developer-form.component';

/**
 * Componente que muestra la lista de desarrolladores de videojuegos en el panel de administración.
 * Permite buscar, filtrar, editar y eliminar desarrolladores de la base de datos.
 */
@Component({
  selector: 'app-developer-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, DeveloperFormComponent, FormsModule],
  templateUrl: './developer-list.component.html',
  styleUrl: './developer-list.component.scss',
})
export class DeveloperListComponent implements OnInit {
  private developerService = inject(DeveloperService);

  /** Referencia al contenedor con scroll para efectos visuales de sombras. */
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  /** Lista completa de desarrolladores. */
  developers: Developer[] = [];
  /** Lista de desarrolladores que coinciden con el criterio de búsqueda. */
  filteredDevelopers: Developer[] = [];
  /** Término de búsqueda para filtrar desarrolladores por nombre. */
  searchTerm: string = '';
  /** Controla la visibilidad del modal para añadir o editar un desarrollador. */
  showModal = false;
  /** ID del desarrollador seleccionado para su edición (null para creación). */
  selectedDeveloperId: number | null = null;
  /** Controla la visibilidad del modal de confirmación de borrado. */
  showDeleteModal = false;
  /** ID del desarrollador que se ha marcado para eliminar. */
  developerToDeleteId: number | null = null;
  /** Indica si los datos se están cargando actualmente. */
  isLoading = true;
  /** Indica si se debe mostrar la sombra superior en el listado. */
  showTopShadow = false;
  /** Indica si se debe mostrar la sombra inferior en el listado. */
  showBottomShadow = false;

  /**
   * Carga inicial de los desarrolladores al activar el componente.
   */
  ngOnInit(): void {
    this.loadDevelopers();
  }

  /**
   * Obtiene todos los desarrolladores desde el servicio y actualiza la vista.
   */
  loadDevelopers() {
    this.isLoading = true;
    this.developerService.getAll().subscribe((data) => {
      this.developers = data;
      this.filterDevelopers();
      this.isLoading = false;
      setTimeout(() => {
        this.onScroll();
      }, 0);
    });
  }

  /**
   * Filtra la lista de desarrolladores en base al término de búsqueda.
   */
  filterDevelopers() {
    if (!this.searchTerm) {
      this.filteredDevelopers = this.developers;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredDevelopers = this.developers.filter((d) =>
        d.name.toLowerCase().includes(lower),
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

  /** Abre el modal para crear un desarrollador nuevo. */
  openCreateModal() {
    this.selectedDeveloperId = null;
    this.showModal = true;
  }

  /** Abre el modal para editar un desarrollador existente. */
  openEditModal(id: number) {
    this.selectedDeveloperId = id;
    this.showModal = true;
  }

  /** Cierra el modal de creación/edición de desarrolladores. */
  closeModal() {
    this.showModal = false;
    this.selectedDeveloperId = null;
  }

  /** Callback ejecutado tras un guardado exitoso en el formulario. */
  onFormSave() {
    this.closeModal();
    this.loadDevelopers();
  }

  /** Abre el modal de confirmación para eliminar un desarrollador. */
  openDeleteModal(id: number) {
    this.developerToDeleteId = id;
    this.showDeleteModal = true;
  }

  /** Cierra el modal de confirmación de borrado. */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.developerToDeleteId = null;
  }

  /** Ejecuta el borrado del desarrollador tras la confirmación del usuario. */
  confirmDelete() {
    if (this.developerToDeleteId) {
      this.developerService
        .delete(this.developerToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadDevelopers();
        });
    }
  }
}
