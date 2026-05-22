/**
 * @file: src/app/pipes/localized-currency.pipe.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Pipe para mostrar importes según idioma/moneda activos del usuario.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../core/services/currency.service';

/** Pipe para mostrar importes según idioma/moneda activos del usuario. */
@Pipe({
  name: 'localizedCurrency',
  standalone: true,
  pure: false,
})
export class LocalizedCurrencyPipe implements PipeTransform {
   /**
    * Inicializa una nueva instancia del pipe LocalizedCurrencyPipe.
    * @param currencyService Servicio encargado de gestionar el tipo de cambio y moneda locales.
    */
  constructor(private currencyService: CurrencyService) { }

  /**
   * Transforma un valor numérico (en euros) a la moneda y formato del idioma del cliente actual.
   * @param value El valor numérico original en Euros que se desea formatear.
   * @param display El formato de visualización de la divisa ('symbol', 'code' o 'none').
   * @param digitsInfo Reglas de formateo numérico de decimales (ej. '1.2-2').
   * @returns El string del importe con el formato de moneda localizado correspondiente.
   */
  transform(
    value: number | string | null | undefined,
    display: 'symbol' | 'code' | 'none' = 'symbol',
    digitsInfo = '1.2-2',
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '';

    const converted = this.currencyService.convertFromEur(numeric);
    const locale = this.currencyService.getLocaleCode();
    const currency = this.currencyService.getCurrencyCode();
    if (display === 'none') {
      const [minFraction = '2', maxFraction = '2'] =
        digitsInfo.split('.')[1]?.split('-') ?? [];
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: Number(minFraction),
        maximumFractionDigits: Number(maxFraction),
      }).format(converted);
    }

    const [minFraction = '2', maxFraction = '2'] =
      digitsInfo.split('.')[1]?.split('-') ?? [];
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: display === 'code' ? 'code' : 'symbol',
      minimumFractionDigits: Number(minFraction),
      maximumFractionDigits: Number(maxFraction),
    }).format(converted);
  }
}
