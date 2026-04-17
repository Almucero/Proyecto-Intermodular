import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly eurToUsdRate = environment.eurToUsdRate ?? 1.08;

  constructor(private languageService: LanguageService) {}

  getCurrencyCode(): 'EUR' | 'USD' {
    return this.languageService.getCurrentLang() === 'en' ? 'USD' : 'EUR';
  }

  getLocaleCode(): string {
    return this.languageService.getCurrentLang() === 'en' ? 'en-US' : 'es-ES';
  }

  convertFromEur(amount: number): number {
    if (!Number.isFinite(amount)) return 0;
    if (this.getCurrencyCode() === 'USD') {
      return amount * this.eurToUsdRate;
    }
    return amount;
  }
}
