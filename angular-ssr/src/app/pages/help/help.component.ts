/**
 * @file: src/app/pages/help/help.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente de la página de Ayuda / FAQ.
 */

import {
  Component,
  HostListener,
  Inject,
  Renderer2,
  signal,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
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
export class HelpComponent implements AfterViewInit {
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
  /** Estado lógico para la transición inicial del modal. */
  screenshotModalOpen = false;
  /** Estado de finalización de salida del modal. */
  screenshotModalClosing = false;
  /** Duración en milisegundos de la animación del modal. */
  private readonly screenshotModalAnimMs = 160;

  /** Referencia del contenedor de tabla de contenidos para scroll horizontal. */
  @ViewChild('helpTocScroller') helpTocScroller?: ElementRef<HTMLDivElement>;

  /** Estado de visibilidad de las flechas de scroll de ayuda. */
  helpScrollState = {
    left: false,
    right: true,
  };

  /** Identificador de plataforma de Angular. */
  private platformId = inject(PLATFORM_ID);
  /** Servicio para detección de cambios reactivos. */
  private cdr = inject(ChangeDetectorRef);

  /**
   * Inicializa el componente de ayuda.
   * @param renderer Instancia de Renderer2 de Angular.
   * @param document El objeto de documento del DOM.
   */
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  /**
   * Método de ciclo de vida que se ejecuta tras inicializar la vista del componente.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateHelpScrollState();
    }, 0);
  }

  /**
   * Actualiza el estado visual del scroll horizontal del índice de contenidos.
   */
  updateHelpScrollState(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const element = this.helpTocScroller?.nativeElement;
    if (element) {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      this.helpScrollState.left = scrollLeft > 4;
      this.helpScrollState.right = scrollLeft + clientWidth < scrollWidth - 4;
      this.cdr.detectChanges();
    }
  }

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
    this.screenshotModalClosing = false;
    this.screenshotModalOpen = false;
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        if (!this.screenshotModalClosing) this.screenshotModalOpen = true;
      }, 10);
    } else {
      this.screenshotModalOpen = true;
    }
  }

  /** Cierra el modal de captura y restaura el scroll del documento. */
  closeScreenshotModal(): void {
    if (this.screenshotModalClosing) return;
    this.screenshotModalClosing = true;
    this.screenshotModalOpen = false;

    setTimeout(() => {
      this.isScreenshotModalOpen.set(false);
      this.screenshotModalImage.set(null);
      this.screenshotModalClosing = false;
      this.screenshotModalOpen = false;
      this.renderer.removeStyle(this.document.body, 'overflow');
    }, this.screenshotModalAnimMs);
  }

  /**
   * Cierra el modal de captura si se presiona la tecla Escape.
   */
  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isScreenshotModalOpen()) {
      this.closeScreenshotModal();
    }
  }
}
