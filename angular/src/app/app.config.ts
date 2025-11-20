import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AUTH_SERVICE } from './core/services/auth.token';
import { StrapiAuthService } from './core/services/strapi-auth.service';
import { LocalStorageAuthService } from './core/services/local-storage-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // Para cambiar entre servicios de autenticación, solo se cambia useClass aquí:
    { provide: AUTH_SERVICE, useClass: LocalStorageAuthService },
  ],
};
