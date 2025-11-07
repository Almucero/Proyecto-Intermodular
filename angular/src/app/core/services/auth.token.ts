import { InjectionToken } from '@angular/core';
import { StrapiAuthService } from './strapi-auth.service';
import { LocalStorageAuthService } from './local-storage-auth.service';

export const AUTH_SERVICE = new InjectionToken<
  StrapiAuthService | LocalStorageAuthService
>('Authentication service');
