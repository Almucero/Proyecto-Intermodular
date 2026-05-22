/**
 * @file: src/app/core/models/base.model.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz base para todos los modelos de datos del sistema.
 */

/**
 * Interfaz base para todos los modelos de datos del sistema.
 */
export interface Model {
  /** Identificador único del modelo. */
  id: number;
  /** Fecha en la que se creó el registro. */
  createdAt?: string | null;
  /** Fecha de la última actualización del registro. */
  updatedAt?: string | null;
}
