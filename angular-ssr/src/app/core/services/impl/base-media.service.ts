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
