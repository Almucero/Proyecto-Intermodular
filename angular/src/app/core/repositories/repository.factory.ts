import { FactoryProvider, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRepositoryHttpService } from './impl/base-repository-http.service';
import { IBaseRepository } from './interfaces/base-repository.interface';
import { Model } from '../models/base.model';
import { IBaseMapping } from './interfaces/base-mapping.interface';
import { BaseRepositoryLocalStorageService } from './impl/base-repository-local-storage.service';
import { IAuthentication } from '../services/interfaces/authentication.interface';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';
import { IAuthMapping } from '../services/interfaces/auth-mapping.interface';
import { MediaService } from '../services/impl/media.service';

// Models
import { Developer } from '../models/developer.model';
import { Game } from '../models/game.model';
import { Genre } from '../models/genre.model';
import { Media } from '../models/media.model';
import { Platform } from '../models/platform.model';
import { Publisher } from '../models/publisher.model';
import { User } from '../models/user.model';

// Tokens
import {
  API_URL_TOKEN,
  AUTH_MAPPING_TOKEN,
  AUTH_ME_API_URL_TOKEN,
  AUTH_SIGN_IN_API_URL_TOKEN,
  AUTH_SIGN_UP_API_URL_TOKEN,
  AUTH_TOKEN,
  BACKEND_TOKEN,
  DEVELOPER_API_URL_TOKEN,
  DEVELOPER_REPOSITORY_MAPPING_TOKEN,
  DEVELOPER_REPOSITORY_TOKEN,
  DEVELOPER_RESOURCE_NAME_TOKEN,
  GAME_API_URL_TOKEN,
  GAME_REPOSITORY_MAPPING_TOKEN,
  GAME_REPOSITORY_TOKEN,
  GAME_RESOURCE_NAME_TOKEN,
  GENRE_API_URL_TOKEN,
  GENRE_REPOSITORY_MAPPING_TOKEN,
  GENRE_REPOSITORY_TOKEN,
  GENRE_RESOURCE_NAME_TOKEN,
  MEDIA_API_URL_TOKEN,
  MEDIA_REPOSITORY_MAPPING_TOKEN,
  MEDIA_REPOSITORY_TOKEN,
  MEDIA_RESOURCE_NAME_TOKEN,
  PLATFORM_API_URL_TOKEN,
  PLATFORM_REPOSITORY_MAPPING_TOKEN,
  PLATFORM_REPOSITORY_TOKEN,
  PLATFORM_RESOURCE_NAME_TOKEN,
  PUBLISHER_API_URL_TOKEN,
  PUBLISHER_REPOSITORY_MAPPING_TOKEN,
  PUBLISHER_REPOSITORY_TOKEN,
  PUBLISHER_RESOURCE_NAME_TOKEN,
  UPLOAD_API_URL_TOKEN,
  USER_API_URL_TOKEN,
  USER_REPOSITORY_MAPPING_TOKEN,
  USER_REPOSITORY_TOKEN,
  USER_RESOURCE_NAME_TOKEN,
} from './repository.tokens';

// Mapping Services
import { DeveloperMappingNodeService } from './impl/developer-mapping-node.service';
import { GameMappingNodeService } from './impl/game-mapping-node.service';
import { GenreMappingNodeService } from './impl/genre-mapping-node.service';
import { MediaMappingNodeService } from './impl/media-mapping-node.service';
import { PlatformMappingNodeService } from './impl/platform-mapping-node.service';
import { PublisherMappingNodeService } from './impl/publisher-mapping-node.service';
import { UserMappingNodeService } from './impl/user-mapping-node.service';
import { NodeAuthenticationService } from '../services/impl/node-authentication.service';
import { NodeAuthMappingService } from '../services/impl/node-auth-mapping.service';
import { BaseMediaService } from '../services/impl/base-media.service';

export function createBaseRepositoryFactory<T extends Model>(
  token: InjectionToken<IBaseRepository<T>>,
  dependencies: any[],
): FactoryProvider {
  return {
    provide: token,
    useFactory: (
      backend: string,
      http: HttpClient,
      auth: IAuthentication,
      apiURL: string,
      resource: string,
      mapping: IBaseMapping<T>,
    ) => {
      switch (backend) {
        case 'http':
          return new BaseRepositoryHttpService<T>(
            http,
            auth,
            apiURL,
            resource,
            mapping,
          );
        case 'local-storage':
          return new BaseRepositoryLocalStorageService<T>(resource, mapping);
        default:
          throw new Error('BACKEND NOT IMPLEMENTED');
      }
    },
    deps: dependencies,
  };
}

export function createBaseMappingFactory<T extends Model>(
  token: InjectionToken<IBaseMapping<T>>,
  dependencies: any[],
  modelType:
    | 'developer'
    | 'game'
    | 'genre'
    | 'media'
    | 'platform'
    | 'publisher'
    | 'user',
): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string) => {
      switch (backend) {
        case 'http':
          switch (modelType) {
            case 'developer':
              return new DeveloperMappingNodeService();
            case 'game':
              return new GameMappingNodeService();
            case 'genre':
              return new GenreMappingNodeService();
            case 'media':
              return new MediaMappingNodeService();
            case 'platform':
              return new PlatformMappingNodeService();
            case 'publisher':
              return new PublisherMappingNodeService();
            case 'user':
              return new UserMappingNodeService();
            default:
              throw new Error('MODEL MAPPING NOT IMPLEMENTED');
          }
        case 'local-storage':
          throw new Error('BACKEND NOT IMPLEMENTED'); // Implement local storage mappings if needed
        default:
          throw new Error('BACKEND NOT IMPLEMENTED');
      }
    },
    deps: dependencies,
  };
}

export function createBaseAuthMappingFactory(
  token: InjectionToken<IAuthMapping>,
  dependencies: any[],
): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string) => {
      switch (backend) {
        case 'http':
          return new NodeAuthMappingService();
        case 'local-storage':
          throw new Error('BACKEND NOT IMPLEMENTED');
        default:
          throw new Error('BACKEND NOT IMPLEMENTED');
      }
    },
    deps: dependencies,
  };
}

// Mappings Factories
export const DeveloperMappingFactory = createBaseMappingFactory<Developer>(
  DEVELOPER_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'developer',
);

export const GameMappingFactory = createBaseMappingFactory<Game>(
  GAME_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'game',
);

export const GenreMappingFactory = createBaseMappingFactory<Genre>(
  GENRE_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'genre',
);

export const MediaMappingFactory = createBaseMappingFactory<Media>(
  MEDIA_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'media',
);

export const PlatformMappingFactory = createBaseMappingFactory<Platform>(
  PLATFORM_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'platform',
);

export const PublisherMappingFactory = createBaseMappingFactory<Publisher>(
  PUBLISHER_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'publisher',
);

export const UserMappingFactory = createBaseMappingFactory<User>(
  USER_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'user',
);

export const AuthMappingFactory: FactoryProvider = createBaseAuthMappingFactory(
  AUTH_MAPPING_TOKEN,
  [BACKEND_TOKEN],
);

export const AuthenticationServiceFactory: FactoryProvider = {
  provide: BaseAuthenticationService,
  useFactory: (
    backend: string,
    signIn: string,
    signUp: string,
    meUrl: string,
    mapping: IAuthMapping,
    http: HttpClient,
  ) => {
    switch (backend) {
      case 'http':
        return new NodeAuthenticationService(); // Assuming NodeAuthenticationService handles http auth
      case 'local-storage':
        throw new Error('BACKEND NOT IMPLEMENTED');
      default:
        throw new Error('BACKEND NOT IMPLEMENTED');
    }
  },
  deps: [
    BACKEND_TOKEN,
    AUTH_SIGN_IN_API_URL_TOKEN,
    AUTH_SIGN_UP_API_URL_TOKEN,
    AUTH_ME_API_URL_TOKEN,
    AUTH_MAPPING_TOKEN,
    HttpClient,
  ],
};

export const MediaServiceFactory: FactoryProvider = {
  provide: BaseMediaService,
  useFactory: (
    backend: string,
    upload: string,
    auth: IAuthentication,
    http: HttpClient,
  ) => {
    switch (backend) {
      case 'http':
      //return new MediaService();
      case 'local-storage':
        throw new Error('BACKEND NOT IMPLEMENTED');
      default:
        throw new Error('BACKEND NOT IMPLEMENTED');
    }
  },
  deps: [
    BACKEND_TOKEN,
    UPLOAD_API_URL_TOKEN,
    BaseAuthenticationService,
    HttpClient,
  ],
};

// Repository Factories
export const DeveloperRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<Developer>(DEVELOPER_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    DEVELOPER_API_URL_TOKEN,
    DEVELOPER_RESOURCE_NAME_TOKEN,
    DEVELOPER_REPOSITORY_MAPPING_TOKEN,
  ]);

export const GameRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<Game>(GAME_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    GAME_API_URL_TOKEN,
    GAME_RESOURCE_NAME_TOKEN,
    GAME_REPOSITORY_MAPPING_TOKEN,
  ]);

export const GenreRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<Genre>(GENRE_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    GENRE_API_URL_TOKEN,
    GENRE_RESOURCE_NAME_TOKEN,
    GENRE_REPOSITORY_MAPPING_TOKEN,
  ]);

export const MediaRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<Media>(MEDIA_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    MEDIA_API_URL_TOKEN,
    MEDIA_RESOURCE_NAME_TOKEN,
    MEDIA_REPOSITORY_MAPPING_TOKEN,
  ]);

export const PlatformRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<Platform>(PLATFORM_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    PLATFORM_API_URL_TOKEN,
    PLATFORM_RESOURCE_NAME_TOKEN,
    PLATFORM_REPOSITORY_MAPPING_TOKEN,
  ]);

export const PublisherRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<Publisher>(PUBLISHER_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    PUBLISHER_API_URL_TOKEN,
    PUBLISHER_RESOURCE_NAME_TOKEN,
    PUBLISHER_REPOSITORY_MAPPING_TOKEN,
  ]);

export const UserRepositoryFactory: FactoryProvider =
  createBaseRepositoryFactory<User>(USER_REPOSITORY_TOKEN, [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    USER_API_URL_TOKEN,
    USER_RESOURCE_NAME_TOKEN,
    USER_REPOSITORY_MAPPING_TOKEN,
  ]);

//media es raro
