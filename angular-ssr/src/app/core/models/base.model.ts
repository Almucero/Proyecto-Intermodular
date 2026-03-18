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
