import { InjectionToken } from '@angular/core';
import { IBaseRepository } from './interfaces/base-repository.interface';

export const REPOSITORY_TOKEN = new InjectionToken<IBaseRepository<any>>(
  'REPOSITORY_TOKEN'
);
