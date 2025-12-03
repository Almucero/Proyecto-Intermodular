import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptorFn } from './core/interceptors/auth.interceptor';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

// Tokens
import {
  API_URL_TOKEN,
  AUTH_MAPPING_TOKEN,
  AUTH_ME_API_URL_TOKEN,
  AUTH_SIGN_IN_API_URL_TOKEN,
  AUTH_SIGN_UP_API_URL_TOKEN,
  BACKEND_TOKEN,
  DEVELOPER_API_URL_TOKEN,
  DEVELOPER_RESOURCE_NAME_TOKEN,
  GAME_API_URL_TOKEN,
  GAME_RESOURCE_NAME_TOKEN,
  GENRE_API_URL_TOKEN,
  GENRE_RESOURCE_NAME_TOKEN,
  MEDIA_API_URL_TOKEN,
  MEDIA_RESOURCE_NAME_TOKEN,
  PLATFORM_API_URL_TOKEN,
  PLATFORM_RESOURCE_NAME_TOKEN,
  PUBLISHER_API_URL_TOKEN,
  PUBLISHER_RESOURCE_NAME_TOKEN,
  UPLOAD_API_URL_TOKEN,
  USER_API_URL_TOKEN,
  USER_RESOURCE_NAME_TOKEN,
} from './core/repositories/repository.tokens';

// Factories
import {
  AuthenticationServiceFactory,
  AuthMappingFactory,
  DeveloperMappingFactory,
  DeveloperRepositoryFactory,
  GameMappingFactory,
  GameRepositoryFactory,
  GenreMappingFactory,
  GenreRepositoryFactory,
  MediaMappingFactory,
  MediaRepositoryFactory,
  PlatformMappingFactory,
  PlatformRepositoryFactory,
  PublisherMappingFactory,
  PublisherRepositoryFactory,
  UserMappingFactory,
  UserRepositoryFactory,
} from './core/repositories/repository.factory';

// Services
import { DeveloperService } from './core/services/impl/developer.service';
import { GameService } from './core/services/impl/game.service';
import { GenreService } from './core/services/impl/genre.service';
import { MediaService } from './core/services/impl/media.service';
import { PlatformService } from './core/services/impl/platform.service';
import { PublisherService } from './core/services/impl/publisher.service';
import { UserService } from './core/services/impl/user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptorFn])),
    provideAnimations(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'es',
      lang: 'es',
    }),

    // Repository Configuration
    { provide: BACKEND_TOKEN, useValue: 'http' },

    // Resource Names
    { provide: DEVELOPER_RESOURCE_NAME_TOKEN, useValue: 'developers' },
    { provide: GAME_RESOURCE_NAME_TOKEN, useValue: 'games' },
    { provide: GENRE_RESOURCE_NAME_TOKEN, useValue: 'genres' },
    { provide: MEDIA_RESOURCE_NAME_TOKEN, useValue: 'media' },
    { provide: PLATFORM_RESOURCE_NAME_TOKEN, useValue: 'platforms' },
    { provide: PUBLISHER_RESOURCE_NAME_TOKEN, useValue: 'publishers' },
    { provide: USER_RESOURCE_NAME_TOKEN, useValue: 'users' },

    // API URLs
    { provide: API_URL_TOKEN, useValue: `${environment.apiUrl}/api` },
    {
      provide: DEVELOPER_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: GAME_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: GENRE_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: MEDIA_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: PLATFORM_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: PUBLISHER_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: USER_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },

    // Auth URLs
    {
      provide: AUTH_SIGN_IN_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api/auth/login`,
    },
    {
      provide: AUTH_SIGN_UP_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api/auth/register`,
    },
    {
      provide: AUTH_ME_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api/users/me`,
    },
    {
      provide: UPLOAD_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api/media/upload`,
    },

    // Mappings
    DeveloperMappingFactory,
    GameMappingFactory,
    GenreMappingFactory,
    MediaMappingFactory,
    PlatformMappingFactory,
    PublisherMappingFactory,
    UserMappingFactory,
    AuthMappingFactory,

    // Repositories
    DeveloperRepositoryFactory,
    GameRepositoryFactory,
    GenreRepositoryFactory,
    MediaRepositoryFactory,
    PlatformRepositoryFactory,
    PublisherRepositoryFactory,
    UserRepositoryFactory,

    // Services
    { provide: DeveloperService, useClass: DeveloperService },
    { provide: GameService, useClass: GameService },
    { provide: GenreService, useClass: GenreService },
    { provide: MediaService, useClass: MediaService },
    { provide: PlatformService, useClass: PlatformService },
    { provide: PublisherService, useClass: PublisherService },
    { provide: UserService, useClass: UserService },

    AuthenticationServiceFactory,
  ],
};
