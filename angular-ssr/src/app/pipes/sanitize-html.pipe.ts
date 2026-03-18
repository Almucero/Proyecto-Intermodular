import { SecurityContext } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Tubería para desinfectar contenido HTML y evitar vulnerabilidades XSS.
 * Utiliza el DomSanitizer de Angular para asegurar el contenido.
 */
@Pipe({
  name: 'sanitizeHtml',
  standalone: true,
})
export class SanitizeHtmlPipe implements PipeTransform {
  /**
   * @param sanitizer Servicio de seguridad de Angular.
   */
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Desinfecta una cadena HTML.
   * @param value HTML potencialmente inseguro.
   * @returns HTML seguro.
   */
  transform(value: string): string {
    if (value == null || value === '') return '';
    return this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
  }
}
