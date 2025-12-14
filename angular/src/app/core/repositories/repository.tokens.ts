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

//Resouce name tokens
export const RESOURCE_NAME_TOKEN = new InjectionToken<string>('ResourceName');
export const DEVELOPER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'DeveloperResourceName'
);
export const MEDIA_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'MediaResourceName'
);
export const GAME_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'GameResourceName'
);
export const GENRE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'GenreResourceName'
);
export const PLATFORM_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PlatformResourceName'
);
export const PUBLISHER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PublisherResourceName'
);
export const USER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'UserResourceName'
);

//Repository tokens
export const REPOSITORY_TOKEN = new InjectionToken<IBaseRepository<any>>(
  'REPOSITORY_TOKEN'
);
export const DEVELOPER_REPOSITORY_TOKEN =
  new InjectionToken<IDeveloperRepository>('IDeveloperRepository');
export const MEDIA_REPOSITORY_TOKEN = new InjectionToken<IMediaRepository>(
  'IMediaRepository'
);
export const GAME_REPOSITORY_TOKEN = new InjectionToken<IGameRepository>(
  'IGameRepository'
);
export const GENRE_REPOSITORY_TOKEN = new InjectionToken<IGenreRepository>(
  'IGenreRepository'
);
export const PLATFORM_REPOSITORY_TOKEN =
  new InjectionToken<IPlatformRepository>('IPlatformRepository');
export const PUBLISHER_REPOSITORY_TOKEN =
  new InjectionToken<IPublisherRepository>('IPublisherRepository');
export const USER_REPOSITORY_TOKEN = new InjectionToken<IUserRepository>(
  'IUserRepository'
);

//Api url tokens
export const API_URL_TOKEN = new InjectionToken<string>('ApiUrl');
export const DEVELOPER_API_URL_TOKEN = new InjectionToken<string>(
  'DeveloperApiUrl'
);
export const MEDIA_API_URL_TOKEN = new InjectionToken<string>('MediaApiUrl');
export const GAME_API_URL_TOKEN = new InjectionToken<string>('GameApiUrl');
export const GENRE_API_URL_TOKEN = new InjectionToken<string>('GenreApiUrl');
export const PLATFORM_API_URL_TOKEN = new InjectionToken<string>(
  'PlatformApiUrl'
);
export const PUBLISHER_API_URL_TOKEN = new InjectionToken<string>(
  'PublisherApiUrl'
);
export const USER_API_URL_TOKEN = new InjectionToken<string>('UserApiUrl');
export const AUTH_SIGN_IN_API_URL_TOKEN = new InjectionToken<string>(
  'AuthSignInApiUrl'
);
export const AUTH_SIGN_UP_API_URL_TOKEN = new InjectionToken<string>(
  'AuthSignUpApiUrl'
);
export const AUTH_ME_API_URL_TOKEN = new InjectionToken<string>('AuthMeApiUrl');
export const UPLOAD_API_URL_TOKEN = new InjectionToken<string>('UploadApiUrl');
export const CHAT_API_URL_TOKEN = new InjectionToken<string>('ChatApiUrl');

//Repository mappings
export const REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<any>>(
  'IBaseRepositoryMapping'
);
export const DEVELOPER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Developer>
>('IDeveloperRepositoryMapping');
export const MEDIA_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Media>
>('IMediaRepositoryMapping');
export const GAME_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Game>
>('IGameRepositoryMapping');
export const GENRE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Genre>
>('IGenreRepositoryMapping');
export const PLATFORM_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Platform>
>('IPlatformRepositoryMapping');
export const PUBLISHER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Publisher>
>('IPublisherRepositoryMapping');
export const USER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<User>
>('IUserRepositoryMapping');

//Auth tokens
export const AUTH_TOKEN = new InjectionToken<IAuthentication>(
  'IAuthentication'
);
export const AUTH_MAPPING_TOKEN = new InjectionToken<IAuthMapping>(
  'IAuthMapping'
);
export const BACKEND_TOKEN = new InjectionToken<string>('Backend');

// New Resource Names
export const CART_ITEM_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'CartItemResourceName'
);
export const PURCHASE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PurchaseResourceName'
);
export const PURCHASE_ITEM_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'PurchaseItemResourceName'
);
export const FAVORITE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'FavoriteResourceName'
);

// New Repository Tokens
import { ICartItemRepository } from './interfaces/cart-item-repository.interface';
import { IPurchaseRepository } from './interfaces/purchase-repository.interface';
import { IPurchaseItemRepository } from './interfaces/purchase-item-repository.interface';
import { IFavoriteRepository } from './interfaces/favorite-repository.interface';

export const CART_ITEM_REPOSITORY_TOKEN =
  new InjectionToken<ICartItemRepository>('ICartItemRepository');
export const PURCHASE_REPOSITORY_TOKEN =
  new InjectionToken<IPurchaseRepository>('IPurchaseRepository');
export const PURCHASE_ITEM_REPOSITORY_TOKEN =
  new InjectionToken<IPurchaseItemRepository>('IPurchaseItemRepository');
export const FAVORITE_REPOSITORY_TOKEN =
  new InjectionToken<IFavoriteRepository>('IFavoriteRepository');

// New API URL Tokens
export const CART_ITEM_API_URL_TOKEN = new InjectionToken<string>(
  'CartItemApiUrl'
);
export const PURCHASE_API_URL_TOKEN = new InjectionToken<string>(
  'PurchaseApiUrl'
);
export const PURCHASE_ITEM_API_URL_TOKEN = new InjectionToken<string>(
  'PurchaseItemApiUrl'
);
export const FAVORITE_API_URL_TOKEN = new InjectionToken<string>(
  'FavoriteApiUrl'
);

// New Repository Mappings
import { CartItem } from '../models/cart-item.model';
import { Purchase } from '../models/purchase.model';
import { PurchaseItem } from '../models/purchase-item.model';
import { Favorite } from '../models/favorite.model';
import { ChatSession } from '../models/chat.model';

export const CART_ITEM_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<CartItem>
>('ICartItemRepositoryMapping');
export const PURCHASE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Purchase>
>('IPurchaseRepositoryMapping');
export const PURCHASE_ITEM_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<PurchaseItem>
>('IPurchaseItemRepositoryMapping');
export const FAVORITE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Favorite>
>('IFavoriteRepositoryMapping');
export const CHAT_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<ChatSession>
>('IChatRepositoryMapping');

// Chat Tokens
import { IChatRepository } from './interfaces/chat-repository.interface';

export const CHAT_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'ChatResourceName'
);
export const CHAT_REPOSITORY_TOKEN = new InjectionToken<IChatRepository>(
  'IChatRepository'
);
