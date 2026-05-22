/**
 * @file: src/app/core/repositories/interfaces/media-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de medios.
 */

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
