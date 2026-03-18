import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';
import { Media } from '../../models/media.model';
import { IMediaService } from '../interfaces/media-service.interface';
import { IMediaRepository } from '../../repositories/interfaces/media-repository.interface';
import { MEDIA_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

/**
 * Servicio para la gestión de recursos multimedia (imágenes, vídeos).
 */
@Injectable({
  providedIn: 'root',
})
export class MediaService extends BaseService<Media> implements IMediaService {
  /**
   * @param repository Repositorio especializado en multimedia (permite subida de archivos).
   */
  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN)
    protected override repository: IMediaRepository,
  ) {
    super(repository);
  }

  /**
   * Sube un archivo físico al servicio de almacenamiento remoto.
   * @param file Archivo a subir.
   * @returns Observable con los metadatos del recurso multimedia creado.
   */
  upload(file: File): Observable<Media> {
    return this.repository.upload(file);
  }
}
