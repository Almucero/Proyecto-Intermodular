import { InjectionToken } from '@angular/core';
import { StrapiAuthService } from './impl/strapi-auth.service';
import { LocalStorageAuthService } from './impl/local-storage-auth.service';

export const AUTH_SERVICE = new InjectionToken<
  StrapiAuthService | LocalStorageAuthService
>('Authentication service');
