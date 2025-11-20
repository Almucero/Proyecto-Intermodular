import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AUTH_SERVICE } from './core/services/auth.token';
import { StrapiAuthService } from './core/services/impl/strapi-auth.service';
import { LocalStorageAuthService } from './core/services/impl/local-storage-auth.service';
import { provideTranslateService } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'es',
      lang: 'es',
    }),
    // Para cambiar entre servicios de autenticación, solo se cambia useClass aquí:
    { provide: AUTH_SERVICE, useClass: LocalStorageAuthService },
  ],
};
