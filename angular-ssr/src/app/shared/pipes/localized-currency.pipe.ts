import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

/** Pipe para mostrar importes según idioma/moneda activos del usuario. */
@Pipe({
  name: 'localizedCurrency',
  standalone: true,
  pure: false,
})
export class LocalizedCurrencyPipe implements PipeTransform {
  /**
     * Constructor no documentado.
     * @param currencyService Parámetro no documentado.
     */
    constructor(private currencyService: CurrencyService) {}

  /**
     * Método no documentado.
     * @param value Parámetro no documentado.
     * @param display Parámetro no documentado.
     * @param digitsInfo Parámetro no documentado.
     * @returns Retorno no documentado.
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
