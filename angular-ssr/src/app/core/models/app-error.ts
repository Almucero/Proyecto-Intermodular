/**
 * Tipos de errores comunes en la aplicación.
 */
export enum ErrorType {
  /** Error de autenticación o sesión. */
  AUTH = 'auth',
  /** Error de conexión de red. */
  NETWORK = 'network',
  /** Error de validación de datos. */
  VALIDATION = 'validation',
  /** Error interno del servidor. */
  SERVER = 'server',
  /** Error no clasificado. */
  UNKNOWN = 'unknown',
}

/**
 * Interfaz que define la estructura de un error personalizado en el sistema.
 */
export interface AppError {
  /** Categoría del error. */
  type: ErrorType;
  /** Mensaje descriptivo para el usuario o log. */
  message: string;
  /** Código técnico del error (opcional). */
  code?: string;
  /** Error original capturado (opcional). */
  originalError?: any;
  /** Marca de tiempo de cuándo ocurrió el error. */
  timestamp: Date;
}
