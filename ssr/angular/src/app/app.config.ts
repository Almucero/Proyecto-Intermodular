import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { serverConnectionInterceptor } from './core/interceptors/server-connection.interceptor';

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
  CART_ITEM_RESOURCE_NAME_TOKEN,
  PURCHASE_RESOURCE_NAME_TOKEN,
  PURCHASE_ITEM_RESOURCE_NAME_TOKEN,
  FAVORITE_RESOURCE_NAME_TOKEN,
  CART_ITEM_API_URL_TOKEN,
  PURCHASE_API_URL_TOKEN,
  PURCHASE_ITEM_API_URL_TOKEN,
  FAVORITE_API_URL_TOKEN,
  CHAT_API_URL_TOKEN,
  CHAT_RESOURCE_NAME_TOKEN,
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
  CartItemMappingFactory,
  CartItemRepositoryFactory,
  PurchaseMappingFactory,
  PurchaseRepositoryFactory,
  PurchaseItemMappingFactory,
  PurchaseItemRepositoryFactory,
  FavoriteMappingFactory,
  FavoriteRepositoryFactory,
  ChatMappingFactory,
  ChatRepositoryFactory,
} from './core/repositories/repository.factory';

// Services
import { DeveloperService } from './core/services/impl/developer.service';
import { GameService } from './core/services/impl/game.service';
import { GenreService } from './core/services/impl/genre.service';
import { MediaService } from './core/services/impl/media.service';
import { PlatformService } from './core/services/impl/platform.service';
import { PublisherService } from './core/services/impl/publisher.service';
import { UserService } from './core/services/impl/user.service';
import { CartItemService } from './core/services/impl/cart-item.service';
import { PurchaseService } from './core/services/impl/purchase.service';
import { PurchaseItemService } from './core/services/impl/purchase-item.service';
import { FavoriteService } from './core/services/impl/favorite.service';
import { ChatService } from './core/services/impl/chat.service';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([serverConnectionInterceptor])
    ),
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
    { provide: CART_ITEM_RESOURCE_NAME_TOKEN, useValue: 'cart' },
    { provide: PURCHASE_RESOURCE_NAME_TOKEN, useValue: 'purchases' },
    {
      provide: PURCHASE_ITEM_RESOURCE_NAME_TOKEN,
      useValue: 'purchase-items',
    },
    { provide: FAVORITE_RESOURCE_NAME_TOKEN, useValue: 'favorites' },
    { provide: CHAT_RESOURCE_NAME_TOKEN, useValue: 'sessions' },

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
    {
      provide: CART_ITEM_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: PURCHASE_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: PURCHASE_ITEM_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: FAVORITE_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api`,
    },
    {
      provide: CHAT_API_URL_TOKEN,
      useValue: `${environment.apiUrl}/api/chat`,
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
    CartItemMappingFactory,
    PurchaseMappingFactory,
    PurchaseItemMappingFactory,
    FavoriteMappingFactory,
    ChatMappingFactory,
    AuthMappingFactory,

    // Repositories
    DeveloperRepositoryFactory,
    GameRepositoryFactory,
    GenreRepositoryFactory,
    MediaRepositoryFactory,
    PlatformRepositoryFactory,
    PublisherRepositoryFactory,
    UserRepositoryFactory,
    CartItemRepositoryFactory,
    PurchaseRepositoryFactory,
    PurchaseItemRepositoryFactory,
    FavoriteRepositoryFactory,
    ChatRepositoryFactory,

    // Services
    { provide: DeveloperService, useClass: DeveloperService },
    { provide: GameService, useClass: GameService },
    { provide: GenreService, useClass: GenreService },
    { provide: MediaService, useClass: MediaService },
    { provide: PlatformService, useClass: PlatformService },
    { provide: PublisherService, useClass: PublisherService },
    { provide: UserService, useClass: UserService },
    { provide: CartItemService, useClass: CartItemService },
    { provide: PurchaseService, useClass: PurchaseService },
    { provide: PurchaseItemService, useClass: PurchaseItemService },
    { provide: FavoriteService, useClass: FavoriteService },
    { provide: ChatService, useClass: ChatService },

    AuthenticationServiceFactory, provideClientHydration(withEventReplay()),
  ],
};
