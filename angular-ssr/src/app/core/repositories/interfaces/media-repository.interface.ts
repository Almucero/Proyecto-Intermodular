import { Media } from '../../models/media.model';
import { IBaseRepository } from './base-repository.interface';
import { Observable } from 'rxjs';

/**
 * Interfaz para el repositorio de medios (imágenes/vídeos).
 */
export interface IMediaRepository extends IBaseRepository<Media> {
  /**
   * Sube un archivo al servidor.
   * @param file Archivo a subir.
   */
  upload(file: File): Observable<Media>;
}
