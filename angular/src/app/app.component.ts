import { HomeComponent } from './pages/home/home.component';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StrapiAuthService } from './core/services/impl/strapi-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], //ErrorToastComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'GameSage';

  strapiAuth: StrapiAuthService = inject(StrapiAuthService);

  constructor() {
    this.strapiAuth;
  }
}
