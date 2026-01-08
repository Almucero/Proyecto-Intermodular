import { Component, inject, HostBinding } from '@angular/core';
import { UiStateService } from '../../../core/services/impl/ui-state.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Language,
  LanguageService,
} from './../../../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  private languageService = inject(LanguageService);
  public uiState = inject(UiStateService);
  currentYear = new Date().getFullYear();

  languages: Language[] = ['es', 'en', 'de', 'fr', 'it'];

  @HostBinding('class.menu-open')
  get menuOpen() {
    return this.uiState.isMenuOpen();
  }

  get currentLang(): Language {
    return this.languageService.getCurrentLang();
  }

  changeLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
  }
}
