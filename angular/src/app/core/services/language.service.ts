import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly LANG_KEY = 'selectedLanguage';
  private defaultLang = 'es';

  constructor(private translate: TranslateService) {
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/es|en/) ? browserLang : 'es');

    const storedLang = this.getStoredLanguage();
    this.changeLanguage(storedLang);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  getCurrentLang(): string {
    return this.translate.currentLang;
  }

  getStoredLanguage(): string {
    return localStorage.getItem(this.LANG_KEY) || this.defaultLang;
  }

  storeLanguage(lang: string): void {
    localStorage.setItem(this.LANG_KEY, lang);
  }
}
