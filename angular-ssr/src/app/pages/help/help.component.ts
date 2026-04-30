import {
  Component,
  HostListener,
  Inject,
  Renderer2,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Componente de la página de Ayuda / FAQ.
 * Resuelve dudas comunes y guía al usuario en el uso de la plataforma.
 */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ maxHeight: '0px', opacity: 0, overflow: 'hidden' }),
        animate('280ms ease-out', style({ maxHeight: '1000px', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ maxHeight: '1000px', opacity: 1, overflow: 'hidden' }),
        animate('220ms ease-out', style({ maxHeight: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class HelpComponent {
  /** Identificadores secuenciales para renderizar todos los ítems FAQ. */
  faqItems = Array.from({ length: 16 }, (_, i) => i + 1);
  /** Estado de apertura de cada ítem FAQ. */
  faqExpanded: Record<number, boolean> = Object.fromEntries(
    this.faqItems.map((id) => [id, id === 1]),
  ) as Record<number, boolean>;
  /** Estado del modal de vista ampliada de imágenes de ayuda. */
  isScreenshotModalOpen = signal(false);
  /** URL de imagen actualmente abierta en el modal. */
  screenshotModalImage = signal<string | null>(null);

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  /**
   * Alterna la apertura/cierre de un bloque FAQ.
   * @param id Identificador del ítem FAQ.
   */
  toggleFaq(id: number): void {
    this.faqExpanded[id] = !this.faqExpanded[id];
  }

  /**
   * Abre el modal de captura usando la URL de la imagen seleccionada.
   * @param imageUrl Ruta de imagen a mostrar en grande.
   */
  openScreenshotModal(imageUrl: string): void {
    if (!imageUrl) return;
    this.screenshotModalImage.set(imageUrl);
    this.isScreenshotModalOpen.set(true);
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  /** Cierra el modal de captura y restaura el scroll del documento. */
  closeScreenshotModal(): void {
    this.isScreenshotModalOpen.set(false);
    this.screenshotModalImage.set(null);
    this.renderer.removeStyle(this.document.body, 'overflow');
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isScreenshotModalOpen()) {
      this.closeScreenshotModal();
    }
  }
}
