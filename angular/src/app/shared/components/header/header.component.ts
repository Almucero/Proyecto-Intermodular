import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Language, LanguageService } from '../../../core/services/language.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
isMenuOpen = false;
isLangMenuOpen = false;

languages: { code: Language; flag: string; name: string }[] = [
    { code: 'es', flag: 'espana.png', name: 'Español' },
    { code: 'en', flag: 'estados-unidos.png', name: 'English' },
    { code: 'de', flag: 'alemania.png', name: 'Deutsch' },
    { code: 'fr', flag: 'francia.png', name: 'Français' },
    { code: 'it', flag: 'italia.png', name: 'Italiano' }
  ];
   @ViewChild('menu') menu!: ElementRef;

  constructor(private http: HttpClient,public languageService: LanguageService) {}

  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleLangMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  setLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.isLangMenuOpen = false;
  }

  get currentFlag() {
    const current = this.languages.find(l => l.code === this.languageService.getCurrentLang());
    return current ? current.flag : 'espana.png';
  }
   @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isMenuOpen && this.menu && !this.menu.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }
}
