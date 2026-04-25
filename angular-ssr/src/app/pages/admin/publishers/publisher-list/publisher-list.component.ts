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
import { PublisherService } from '../../../../core/services/impl/publisher.service';
import { Publisher } from '../../../../core/models/publisher.model';
import { PublisherFormComponent } from '../publisher-form/publisher-form.component';

/**
 * Componente que muestra la lista de editores (publishers) de videojuegos en el panel de administración.
 * Permite gestionar (listar, filtrar, editar, borrar) los editores registrados en el sistema.
 */
@Component({
  selector: 'app-publisher-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PublisherFormComponent, FormsModule],
  templateUrl: './publisher-list.component.html',
  styleUrl: './publisher-list.component.scss',
})
export class PublisherListComponent implements OnInit {
  private publisherService = inject(PublisherService);
  private readonly MIN_SKELETON_MS = 550;

  /** Referencia al contenedor con scroll para manejar efectos visuales de sombras. */
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  /** Lista completa de editores. */
  publishers: Publisher[] = [];
  /** Lista de editores filtrados según el término de búsqueda. */
  filteredPublishers: Publisher[] = [];
  /** Término de búsqueda para filtrar editores por nombre. */
  searchTerm: string = '';
  /** Controla la visibilidad del modal para añadir o editar un editor. */
  showModal = false;
  /** ID del editor seleccionado para su edición (null para creación). */
  selectedPublisherId: number | null = null;
  /** Controla la visibilidad del modal de confirmación de borrado. */
  showDeleteModal = false;
  /** ID del editor que se ha marcado para eliminar. */
  publisherToDeleteId: number | null = null;
  /** Indica si la lista está cargando datos del servidor. */
  isLoading = true;
  /** Indica si debe mostrarse la sombra superior por desplazamiento de scroll. */
  showTopShadow = false;
  /** Indica si debe mostrarse la sombra inferior por desplazamiento de scroll. */
  showBottomShadow = false;

  /**
   * Carga inicial de editores al activar el componente.
   */
  ngOnInit(): void {
    this.loadPublishers();
  }

  /**
   * Obtiene todos los editores desde el servicio y actualiza la vista.
   */
  loadPublishers() {
    this.isLoading = true;
    const loadStartedAt = Date.now();
    this.publisherService.getAll().subscribe((data) => {
      const elapsed = Date.now() - loadStartedAt;
      const remaining = Math.max(0, this.MIN_SKELETON_MS - elapsed);
      setTimeout(() => {
        this.publishers = data;
        this.filterPublishers();
        this.isLoading = false;
        setTimeout(() => {
          this.onScroll();
        }, 0);
      }, remaining);
    });
  }

  /**
   * Filtra los editores localmente basándose en el término de búsqueda por nombre.
   */
  filterPublishers() {
    if (!this.searchTerm) {
      this.filteredPublishers = this.publishers;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredPublishers = this.publishers.filter((p) =>
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

  /** Abre el modal para crear un nuevo editor. */
  openCreateModal() {
    this.selectedPublisherId = null;
    this.showModal = true;
  }

  /** Abre el modal para editar un editor existente. */
  openEditModal(id: number) {
    this.selectedPublisherId = id;
    this.showModal = true;
  }

  /** Cierra el modal de creación/edición de editores. */
  closeModal() {
    this.showModal = false;
    this.selectedPublisherId = null;
  }

  /** Callback ejecutado tras un guardado exitoso en el formulario. */
  onFormSave() {
    this.closeModal();
    this.loadPublishers();
  }

  /** Abre el modal de confirmación para eliminar un editor. */
  openDeleteModal(id: number) {
    this.publisherToDeleteId = id;
    this.showDeleteModal = true;
  }

  /** Cierra el modal de confirmación de borrado. */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.publisherToDeleteId = null;
  }

  /** Ejecuta el borrado del editor tras la confirmación del usuario. */
  confirmDelete() {
    if (this.publisherToDeleteId) {
      this.publisherService
        .delete(this.publisherToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadPublishers();
        });
    }
  }
}
