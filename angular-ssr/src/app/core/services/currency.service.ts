import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { environment } from '../../../environments/environment';

/** Servicio para resolver moneda, locale y conversión básica desde EUR. */
@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  /** Tasa de conversión EUR -> USD usada en UI cuando aplica. */
  private readonly eurToUsdRate = environment.eurToUsdRate ?? 1.08;

  /**
       * Documentado.
       * @param languageService Servicio de idioma para inferir moneda/región.
       */
  constructor(/** Servicio de idioma para inferir moneda/región. */ private languageService: LanguageService) {}

  /**
   * Devuelve el código de moneda según idioma activo.
   * @returns Código ISO de moneda.
   */
  getCurrencyCode(): 'EUR' | 'USD' {
    return this.languageService.getCurrentLang() === 'en' ? 'USD' : 'EUR';
  }

  /**
   * Devuelve locale para formateo numérico/monetario.
   * @returns Locale BCP-47.
   */
  getLocaleCode(): string {
    return this.languageService.getCurrentLang() === 'en' ? 'en-US' : 'es-ES';
  }

  /**
   * Convierte un importe base en EUR a la moneda de visualización.
   * @param amount Importe origen en euros.
   * @returns Importe convertido o 0 si no es válido.
   */
  convertFromEur(amount: number): number {
    if (!Number.isFinite(amount)) return 0;
    if (this.getCurrencyCode() === 'USD') {
      return amount * this.eurToUsdRate;
    }
    return amount;
  }
}
