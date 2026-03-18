import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Directiva para resaltar elementos al pasar el ratón por encima.
 * Cambia el color de fondo dinámicamente.
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  private _appHighlight: string = 'yellow';

  /** Color de resaltado al entrar el cursor. Por defecto es amarillo. */
  @Input() set appHighlight(color: string) {
    if (color) this._appHighlight = color;
  }

  get appHighlight(): string {
    return this._appHighlight;
  }

  /** Color de fondo por defecto cuando no hay resaltado. */
  @Input() highlightDefault: string = '';

  private originalBackground: string = '';

  /**
   * @param el Referencia al elemento.
   * @param renderer Utilidad para manipular el DOM de forma segura.
   * @param platformId Identificador de plataforma.
   */
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Captura el color de fondo original al inicializar el componente.
   */
  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.originalBackground = this.highlightDefault || '';
      return;
    }
    const computedStyle = window.getComputedStyle(this.el.nativeElement);
    this.originalBackground =
      this.highlightDefault || computedStyle.backgroundColor;
  }

  /** Aplica el resaltado al entrar el ratón. */
  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.appHighlight,
    );
  }

  /** Restaura el color original al salir el ratón. */
  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.originalBackground,
    );
  }
}
