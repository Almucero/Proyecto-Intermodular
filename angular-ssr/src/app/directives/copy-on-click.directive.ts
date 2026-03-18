import {
  Directive,
  HostListener,
  Input,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Directiva para copiar texto al portapapeles al hacer clic.
 * Cambia temporalmente el color de fondo para dar feedback visual.
 */
@Directive({
  selector: '[appCopyOnClick]',
  standalone: true,
})
export class CopyOnClickDirective {
  /** Texto opcional a copiar. Si no se provee, se copiará el innerText del elemento. */
  @Input() appCopyOnClick: string = '';

  /**
   * @param el Referencia al elemento del DOM.
   * @param platformId Identificador de la plataforma (Browser/Server).
   */
  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Maneja el evento de clic en el elemento.
   * Copia el texto al portapapeles y cambia el fondo a verde momentáneamente.
   */
  @HostListener('click') onClick() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const textToCopy = this.appCopyOnClick || this.el.nativeElement.innerText;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalBg = this.el.nativeElement.style.backgroundColor;
      this.el.nativeElement.style.backgroundColor = '#4caf50';

      setTimeout(() => {
        this.el.nativeElement.style.backgroundColor = originalBg;
      }, 300);
    });
  }
}
