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
import { PlatformService } from '../../../../core/services/impl/platform.service';
import { Platform } from '../../../../core/models/platform.model';
import { PlatformFormComponent } from '../platform-form/platform-form.component';

/**
 * Componente que muestra la lista de plataformas de videojuegos en el panel de administración.
 * Permite gestionar (listar, filtrar, editar, borrar) las plataformas soportadas por el sistema.
 */
@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PlatformFormComponent, FormsModule],
  templateUrl: './platform-list.component.html',
  styleUrl: './platform-list.component.scss',
})
export class PlatformListComponent implements OnInit {
  private platformService = inject(PlatformService);

  /** Referencia al contenedor con scroll para manejar efectos visuales de sombras. */
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  /** Lista completa de plataformas disponibles. */
  platforms: Platform[] = [];
  /** Lista de plataformas filtradas según el criterio de búsqueda. */
  filteredPlatforms: Platform[] = [];
  /** Término de búsqueda para filtrar plataformas por nombre. */
  searchTerm: string = '';
  /** Controla la visibilidad del modal de creación/edición de plataformas. */
  showModal = false;
  /** Almacena el ID de la plataforma seleccionada para edición (null si es creación). */
  selectedPlatformId: number | null = null;
  /** Controla la visibilidad del modal de confirmación de eliminación. */
  showDeleteModal = false;
  /** Almacena el ID de la plataforma que se pretende eliminar. */
  platformToDeleteId: number | null = null;
  /** Indica si la lista está cargando datos del servidor. */
  isLoading = true;
  /** Indica si debe mostrarse la sombra superior por desplazamiento de scroll. */
  showTopShadow = false;
  /** Indica si debe mostrarse la sombra inferior por desplazamiento de scroll. */
  showBottomShadow = false;

  /**
   * Carga inicial de plataformas al iniciarse el componente.
   */
  ngOnInit(): void {
    this.loadPlatforms();
  }

  /**
   * Obtiene todas las plataformas desde el servicio y actualiza los listados.
   */
  loadPlatforms() {
    this.isLoading = true;
    this.platformService.getAll().subscribe((data) => {
      this.platforms = data;
      this.filterPlatforms();
      this.isLoading = false;
      setTimeout(() => {
        this.onScroll();
      }, 0);
    });
  }

  /**
   * Filtra las plataformas localmente según el término de búsqueda introducido.
   */
  filterPlatforms() {
    if (!this.searchTerm) {
      this.filteredPlatforms = this.platforms;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredPlatforms = this.platforms.filter((p) =>
        p.name.toLowerCase().includes(lower),
      );
    }
    setTimeout(() => {
      this.onScroll();
    }, 0);
  }

  /**
   * Maneja el evento de scroll para actualizar el estado de las sombras visuales.
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

  /** Abre el modal para crear una nueva plataforma. */
  openCreateModal() {
    this.selectedPlatformId = null;
    this.showModal = true;
  }

  /** Abre el modal para editar una plataforma existente. */
  openEditModal(id: number) {
    this.selectedPlatformId = id;
    this.showModal = true;
  }

  /** Cierra el modal de creación/edición. */
  closeModal() {
    this.showModal = false;
    this.selectedPlatformId = null;
  }

  /** Callback ejecutado tras un guardado de formulario exitoso. */
  onFormSave() {
    this.closeModal();
    this.loadPlatforms();
  }

  /** Abre el modal de confirmación para eliminar una plataforma. */
  openDeleteModal(id: number) {
    this.platformToDeleteId = id;
    this.showDeleteModal = true;
  }

  /** Cierra el modal de confirmación de borrado. */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.platformToDeleteId = null;
  }

  /** Ejecuta la eliminación definitiva de la plataforma tras confirmar. */
  confirmDelete() {
    if (this.platformToDeleteId) {
      this.platformService
        .delete(this.platformToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadPlatforms();
        });
    }
  }
}
