import { HomeComponent } from './pages/home/home.component';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StrapiAuthService } from './core/services/strapi-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'credentials';

  strapiAuth: StrapiAuthService = inject(StrapiAuthService);

  constructor() {
    this.strapiAuth;
  }
}
