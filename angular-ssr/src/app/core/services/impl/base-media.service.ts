/**
 * @file: src/app/core/services/impl/base-media.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Clase base abstracta para servicios de gestión de medios.
 */

import { Observable } from 'rxjs';

/**
 * Clase abstracta que define el contrato para los servicios de gestión de medios (imágenes, vídeos).
 * @template T Tipo del resultado de la subida (por defecto number para IDs).
 */
export abstract class BaseMediaService<T = number> {
  /**
   * Sube un archivo (blob) al servidor de medios.
   * @param blob Contenido binario del archivo.
   * @returns Un Observable con el resultado de la subida.
   */
  abstract upload(blob: Blob): Observable<T>;
}
