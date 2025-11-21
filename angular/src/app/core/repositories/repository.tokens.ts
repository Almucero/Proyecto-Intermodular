import { InjectionToken } from '@angular/core';
import { IAuthentication } from '../services/interfaces/authentication.interface';
import { IBaseRepository } from './interfaces/base-repository.interface';
import { IDeveloperRepository } from './interfaces/developer-repository.interface';
import { IGameImageRepository } from './interfaces/game-image-repository.interface';
import { IGameRepository } from './interfaces/game-repository.interface';
import { IGenreRepository } from './interfaces/genre-repository.interface';
import { IPlatformRepository } from './interfaces/platform-repository.interface';
import { IPublisherRepository } from './interfaces/publisher-repository.interface';
import { IUserRepository } from './interfaces/user-repositoy.interface';
import { IBaseMapping } from './interfaces/base-mapping.interface';
import { Developer } from '../models/developer.model';
import { GameImage } from '../models/game-image.model';
import { Game } from '../models/game.model';
import { Genre } from '../models/genre.model';
import { Platform } from '../models/platform.model';
import { Publisher } from '../models/publisher.model';
import { User } from '../models/auth.model';

//Resouce name tokens
export const RESOURCE_NAME_TOKEN = new InjectionToken<string>('ResourceName');
export const DEVELOPER_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'DeveloperResourceName'
);
export const GAME_IMAGE_RESOURCE_NAME_TOKEN = new InjectionToken<string>(
  'GameImageResourceName'
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
export const DEVELOPER_REPOSITORY_NAME_TOKEN =
  new InjectionToken<IDeveloperRepository>('IDeveloperRepository');
export const GAME_IMAGE_REPOSITORY_NAME_TOKEN =
  new InjectionToken<IGameImageRepository>('IGameImageRepository');
export const GAME_REPOSITORY_NAME_TOKEN = new InjectionToken<IGameRepository>(
  'IGameRepository'
);
export const GENRE_REPOSITORY_NAME_TOKEN = new InjectionToken<IGenreRepository>(
  'IGenreRepository'
);
export const PLATFORM_REPOSITORY_NAME_TOKEN =
  new InjectionToken<IPlatformRepository>('IPlatformRepository');
export const PUBLISHER_REPOSITORY_NAME_TOKEN =
  new InjectionToken<IPublisherRepository>('IPublisherRepository');
export const USER_REPOSITORY_NAME_TOKEN = new InjectionToken<IUserRepository>(
  'IUserRepository'
);

//Api url tokens
export const API_URL_TOKEN = new InjectionToken<string>('ApiUrl');
export const DEVELOPER_API_URL_TOKEN = new InjectionToken<string>(
  'DeveloperApiUrl'
);
export const GAME_IMAGE_API_URL_TOKEN = new InjectionToken<string>(
  'GameImageApiUrl'
);
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

//Repository mappings
export const REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<any>>(
  'IBaseRepositoryMapping'
);
export const DEVELOPER_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<Developer>
>('IDeveloperRepositoryMapping');
export const GAME_IMAGE_REPOSITORY_MAPPING_TOKEN = new InjectionToken<
  IBaseMapping<GameImage>
>('IGameImageRepositoryMapping');
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
export const AUTH_MAPPING_TOKEN = new InjectionToken<IBaseMapping<User>>(
  'IAuthMapping'
);
export const BACKEND_TOKEN = new InjectionToken<string>('Backend');
