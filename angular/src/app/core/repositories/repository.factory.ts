import { FactoryProvider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRepositoryHttpService } from './impl/base-repository-http.service';
import { IBaseRepository } from './interfaces/base-repository.interface';

export function createHttpRepository<T>(
  http: HttpClient,
  apiUrl: string
): IBaseRepository<T> {
  return new BaseRepositoryHttpService<T>(http, apiUrl);
}
