import { Inject, Injectable } from '@angular/core';
import { BaseRepositoryHttpService } from './base-repository-http.service';
import { Media } from '../../models/media.model';
import { IMediaRepository } from '../interfaces/media-repository.interface';
import { HttpClient } from '@angular/common/http';
import { IAuthentication } from '../../services/interfaces/authentication.interface';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import {
  API_URL_TOKEN,
  AUTH_TOKEN,
  MEDIA_REPOSITORY_MAPPING_TOKEN,
  MEDIA_RESOURCE_NAME_TOKEN,
  UPLOAD_API_URL_TOKEN,
} from '../repository.tokens';
import { Observable, map, switchMap } from 'rxjs';

/**
 * Repositorio HTTP especializado para la gestión de medios.
 * Extiende {@link BaseRepositoryHttpService} y añade soporte para la subida de archivos (upload).
 */
@Injectable({
  providedIn: 'root',
})
export class MediaRepositoryHttpService
  extends BaseRepositoryHttpService<Media>
  implements IMediaRepository
{
  /**
   * @param http Cliente HTTP.
   * @param auth Servicio de autenticación.
   * @param apiUrl URL base de la API.
   * @param resource Recurso de medios.
   * @param mapping Mapeador de medios.
   * @param uploadUrl URL específica para la subida de archivos.
   */
  constructor(
    protected override http: HttpClient,
    @Inject(AUTH_TOKEN) protected override auth: IAuthentication,
    @Inject(API_URL_TOKEN) protected override apiUrl: string,
    @Inject(MEDIA_RESOURCE_NAME_TOKEN) protected override resource: string,
    @Inject(MEDIA_REPOSITORY_MAPPING_TOKEN)
    protected override mapping: IBaseMapping<Media>,
    @Inject(UPLOAD_API_URL_TOKEN) protected uploadUrl: string,
  ) {
    super(http, auth, apiUrl, resource, mapping);
  }

  /**
   * Sube un archivo al servidor.
   * Utiliza FormData para enviar el archivo y asocia el ID del usuario actual si está autenticado.
   * @param file Archivo físico a subir.
   * @returns Observable con el modelo Media resultante.
   */
  upload(file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'user');

    return this.auth.me().pipe(
      map((user) => {
        if (user && user.id) {
          formData.append('id', user.id.toString());
        }
        return formData;
      }),
      switchMap((formData) =>
        this.http.post<Media>(this.uploadUrl, formData, {
          headers: this.getHeaders(),
        }),
      ),
      map((res) => this.mapping.getAdded(res)),
    );
  }
}
