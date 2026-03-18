import { Observable } from 'rxjs';
import { Media } from '../../models/media.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define las operaciones para el servicio de multimedia.
 */
export interface IMediaService extends IBaseService<Media> {
  /**
   * Sube un archivo al servidor.
   * @param file Archivo a subir.
   */
  upload(file: File): Observable<Media>;
}
