import { HomeComponent } from './pages/home/home.component';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';
import { LanguageService } from './core/services/language.service';

import { AUTH_SERVICE } from './core/services/auth.token';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ErrorToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'GameSage';

  private authService = inject(AUTH_SERVICE);
  private languageService = inject(LanguageService);

  constructor() {
    this.authService;
  }
}
