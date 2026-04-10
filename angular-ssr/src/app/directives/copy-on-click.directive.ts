import {
  Directive,
  HostListener,
  Input,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
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
      this.animateCopyIcon();
      this.showCopiedPopup();
    });
  }

  private animateCopyIcon() {
    const element = this.el.nativeElement as HTMLElement;
    const originalTransition = element.style.transition;
    const originalTransform = element.style.transform;
    element.style.transition = 'transform 160ms ease';
    element.style.transform = 'scale(1.22)';
    setTimeout(() => {
      element.style.transform = originalTransform;
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, 170);
    }, 160);
  }

  private showCopiedPopup() {
    const element = this.el.nativeElement as HTMLElement;
    const rect = element.getBoundingClientRect();
    const popup = document.createElement('span');
    popup.textContent = this.translate.instant('tooltips.copied');
    popup.style.position = 'fixed';
    popup.style.left = `${rect.right + 8}px`;
    popup.style.top = `${rect.top + rect.height / 2}px`;
    popup.style.transform = 'translateY(-50%)';
    popup.style.background = 'rgba(17, 24, 39, 0.95)';
    popup.style.border = '1px solid rgba(34, 211, 238, 0.45)';
    popup.style.borderRadius = '6px';
    popup.style.padding = '4px 8px';
    popup.style.fontSize = '11px';
    popup.style.fontWeight = '600';
    popup.style.color = '#67e8f9';
    popup.style.zIndex = '99999';
    popup.style.pointerEvents = 'none';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 120ms ease';
    document.body.appendChild(popup);
    requestAnimationFrame(() => {
      popup.style.opacity = '1';
    });
    setTimeout(() => {
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 130);
    }, 850);
  }
}
