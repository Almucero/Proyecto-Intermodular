import { Pipe, PipeTransform } from '@angular/core';

/**
 * Tubería para capitalizar cada palabra de una cadena de texto.
 * Convierte la primera letra de cada palabra a mayúscula y el resto a minúscula.
 */
@Pipe({
  name: 'capitalize',
  standalone: true,
})
export class CapitalizePipe implements PipeTransform {
  /**
   * Transforma el texto de entrada.
   * @param value Cadena de texto a transformar.
   * @returns Texto capitalizado.
   */
  transform(value: string): string {
    if (!value) return value;
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
