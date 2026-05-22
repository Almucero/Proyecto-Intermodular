/**
 * @file: src/app/core/repositories/repository.tokens.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Tokens de inyección de dependencias para repositorios y mappings.
 */

import { InjectionToken } from '@angular/core';
import { IAuthentication } from '../services/interfaces/authentication.interface';
import { IBaseRepository } from './interfaces/base-repository.interface';
import { IDeveloperRepository } from './interfaces/developer-repository.interface';
import { IGameRepository } from './interfaces/game-repository.interface';
import { IGenreRepository } from './interfaces/genre-repository.interface';
import { IPlatformRepository } from './interfaces/platform-repository.interface';
import { IPublisherRepository } from './interfaces/publisher-repository.interface';
import { IUserRepository } from './interfaces/user-repository.interface';
import { IBaseMapping } from './interfaces/base-mapping.interface';
import { Developer } from '../models/developer.model';
import { Media } from '../models/media.model';
import { Game } from '../models/game.model';
import { Genre } from '../models/genre.model';
import { Platform } from '../models/platform.model';
import { Publisher } from '../models/publisher.model';
import { User } from '../models/user.model';
import { IAuthMapping } from '../services/interfaces/auth-mapping.interface';
import { IMediaRepository } from './interfaces/media-repository.interface';

// --- Tokens para nombres de recursos ---

/** Token para el nombre del recurso genérico. */
export const RESOURCE_NAME_TOKEN = new InjectionToken<string>('ResourceName');
/** Token para nombre de recurso de desarrolladoras. */
export const DEVELOPER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'DeveloperResourceName',
);
/** Token para nombre de recurso de media. */
export const MEDIA_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'MediaResourceName',
);
/** Token para nombre de recurso de juegos. */
export const GAME_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'GameResourceName',
);
/** Token para nombre de recurso de géneros. */
export const GENRE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'GenreResourceName',
);
/** Token para nombre de recurso de plataformas. */
export const PLATFORM_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PlatformResourceName',
);
/** Token para nombre de recurso de publishers. */
export const PUBLISHER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PublisherResourceName',
);
/** Token para nombre de recurso de usuarios. */
export const USER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'UserResourceName',
);

// --- Tokens para repositorios ---

/** Token para el repositorio genérico. */
export const REPOSITORY_TOKEN = new InjectionToken<IBaseRepository<any>>(
  'REPOSITORY_TOKEN',
);
/** Token para el repositorio de desarrolladoras. */
export const DEVELOPER_REPOSITORY_TOKEN =
  new InjectionToken<IDeveloperRepository>('IDeveloperRepository');
/** Token para el repositorio de medios. */
export const MEDIA_REPOSITORY_TOKEN = new InjectionToken<IMediaRepository>(
  'IMediaRepository',
);
/** Token para el repositorio de juegos. */
export const GAME_REPOSITORY_TOKEN = new InjectionToken<IGameRepository>(
  'IGameRepository',
);
/** Token para el repositorio de géneros. */
export const GENRE_REPOSITORY_TOKEN = new InjectionToken<IGenreRepository>(
  'IGenreRepository',
);
/** Token para el repositorio de plataformas. */
export const PLATFORM_REPOSITORY_TOKEN =
  new InjectionToken<IPlatformRepository>('IPlatformRepository');
/** Token para el repositorio de distribuidoras. */
export const PUBLISHER_REPOSITORY_TOKEN =
  new InjectionToken<IPublisherRepository>('IPublisherRepository');
/** Token para el repositorio de usuarios. */
export const USER_REPOSITORY_TOKEN = new InjectionToken<IUserRepository>(
  'IUserRepository',
);

// --- Tokens para URLs de la API ---

/** Token para la URL base de la API. */
export const API_URL_TOKEN = new InjectionToken<string>('ApiUrl');
/** Token para la URL de la API de desarrolladoras. */
export const DEVELOPER_API_URL_TOKEN = new InjectionToken<string>(
  'DeveloperApiUrl',
);
/** Token para la URL de la API de medios. */
export const MEDIA_API_URL_TOKEN = new InjectionToken<string>('MediaApiUrl');
/** Token para la URL de la API de juegos. */
export const GAME_API_URL_TOKEN = new InjectionToken<string>('GameApiUrl');
/** Token para la URL de la API de géneros. */
export const GENRE_API_URL_TOKEN = new InjectionToken<string>('GenreApiUrl');
/** Token para la URL de la API de plataformas. */
export const PLATFORM_API_URL_TOKEN = new InjectionToken<string>(
  'PlatformApiUrl',
);
/** Token para la URL de la API de distribuidoras. */
export const PUBLISHER_API_URL_TOKEN = new InjectionToken<string>(
  'PublisherApiUrl',
);
/** Token para la URL de la API de usuarios. */
export const USER_API_URL_TOKEN = new InjectionToken<string>('UserApiUrl');
/** Token para la URL de inicio de sesión. */
export const AUTH_SIGN_IN_API_URL_TOKEN = new InjectionToken<string>(
  'AuthSignInApiUrl',
);
/** Token para la URL de registro. */
export const AUTH_SIGN_UP_API_URL_TOKEN = new InjectionToken<string>(
  'AuthSignUpApiUrl',
);
/** Token para la URL de obtención de datos del usuario autenticado. */
export const AUTH_ME_API_URL_TOKEN = new InjectionToken<string>('AuthMeApiUrl');
/** Token para la URL de subida de archivos. */
export const UPLOAD_API_URL_TOKEN = new InjectionToken<string>('UploadApiUrl');
/** Token para la URL de la API de chat. */
export const CHAT_API_URL_TOKEN = new InjectionToken<string>('ChatApiUrl');

/** Token para mapeo genérico base de entidades. */
export const REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<any>>(
  'IBaseRepositoryMapping',
);
/** Token para mapeo de desarrolladoras. */
export const DEVELOPER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Developer>
>('IDeveloperRepositoryMapping');
/** Token para mapeo de media. */
export const MEDIA_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Media>
>('IMediaRepositoryMapping');
/** Token para mapeo de juegos. */
export const GAME_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Game>
>('IGameRepositoryMapping');
/** Token para mapeo de géneros. */
export const GENRE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Genre>
>('IGenreRepositoryMapping');
/** Token para mapeo de plataformas. */
export const PLATFORM_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Platform>
>('IPlatformRepositoryMapping');
/** Token para mapeo de publishers. */
export const PUBLISHER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Publisher>
>('IPublisherRepositoryMapping');
/** Token para mapeo de usuarios. */
export const USER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<User>
>('IUserRepositoryMapping');

/** Token del servicio de autenticación de dominio. */
export const AUTH_TOKEN = new InjectionToken<IAuthentication>(
  'IAuthentication',
);
/** Token del mapeador de autenticación. */
export const AUTH_MAPPING_TOKEN = new InjectionToken<IAuthMapping>(
  'IAuthMapping',
);
/** Token que define backend activo (http/local-storage). */
export const BACKEND_TOKEN = new InjectionToken<string>('Backend');

/** Token de nombre de recurso de carrito. */
export const CART_ITEM_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'CartItemResourceName',
);
/** Token de nombre de recurso de compras. */
export const PURCHASE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PurchaseResourceName',
);
/** Token de nombre de recurso de líneas de compra. */
export const PURCHASE_ITEM_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PurchaseItemResourceName',
);
/** Token de nombre de recurso de favoritos. */
export const FAVORITE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'FavoriteResourceName',
);

import { ICartItemRepository } from './interfaces/cart-item-repository.interface';
import { IPurchaseRepository } from './interfaces/purchase-repository.interface';
import { IPurchaseItemRepository } from './interfaces/purchase-item-repository.interface';
import { IFavoriteRepository } from './interfaces/favorite-repository.interface';

/** Token del repositorio de ítems de carrito. */
export const CART_ITEM_REPOSITORY_TOKEN =
  new InjectionToken<ICartItemRepository>('ICartItemRepository');
/** Token del repositorio de compras. */
export const PURCHASE_REPOSITORY_TOKEN =
  new InjectionToken<IPurchaseRepository>('IPurchaseRepository');
/** Token del repositorio de líneas de compra. */
export const PURCHASE_ITEM_REPOSITORY_TOKEN =
  new InjectionToken<IPurchaseItemRepository>('IPurchaseItemRepository');
/** Token del repositorio de favoritos. */
export const FAVORITE_REPOSITORY_TOKEN =
  new InjectionToken<IFavoriteRepository>('IFavoriteRepository');

/** Token de URL API de carrito. */
export const CART_ITEM_API_URL_TOKEN = new InjectionToken<string>(
  'CartItemApiUrl',
);
/** Token de URL API de compras. */
export const PURCHASE_API_URL_TOKEN = new InjectionToken<string>(
  'PurchaseApiUrl',
);
/** Token de URL API de líneas de compra. */
export const PURCHASE_ITEM_API_URL_TOKEN = new InjectionToken<string>(
  'PurchaseItemApiUrl',
);
/** Token de URL API de favoritos. */
export const FAVORITE_API_URL_TOKEN = new InjectionToken<string>(
  'FavoriteApiUrl',
);

import { CartItem } from '../models/cart-item.model';
import { Purchase } from '../models/purchase.model';
import { PurchaseItem } from '../models/purchase-item.model';
import { Favorite } from '../models/favorite.model';
import { ChatSession } from '../models/chat.model';

/** Token de mapeo para ítems de carrito. */
export const CART_ITEM_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<CartItem>
>('ICartItemRepositoryMapping');
/** Token de mapeo para compras. */
export const PURCHASE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Purchase>
>('IPurchaseRepositoryMapping');
/** Token de mapeo para líneas de compra. */
export const PURCHASE_ITEM_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<PurchaseItem>
>('IPurchaseItemRepositoryMapping');
/** Token de mapeo para favoritos. */
export const FAVORITE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Favorite>
>('IFavoriteRepositoryMapping');
/** Token de mapeo para chat/sesiones. */
export const CHAT_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<ChatSession>
>('IChatRepositoryMapping');

import { IChatRepository } from './interfaces/chat-repository.interface';

/** Token del nombre de recurso para sesiones de chat. */
export const CHAT_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'ChatResourceName',
);
/** Token del repositorio de chat. */
export const CHAT_REPOSITORY_TOKEN = new InjectionToken<IChatRepository>(
  'IChatRepository',
);
