import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppError, ErrorType } from '../models/app-error';

/**
 * Servicio de gestión centralizada de errores de la aplicación.
 *
 * Proporciona una forma unificada de manejar errores desde cualquier parte
 * de la aplicación, convirtiéndolos en mensajes legibles para el usuario
 * y mostrándolos mediante un toast global.
 *
 * Características:
 * - Conversión automática de HttpErrorResponse a mensajes legibles
 * - Soporte para códigos de error personalizados
 * - Auto-limpieza de errores después de un tiempo configurable
 * - Señales reactivas para integración con componentes
 */
@Injectable({ providedIn: 'root' })
export class ErrorService {
  private currentError = signal<AppError | null>(null);

  error = this.currentError.asReadonly();

  private errorMap = new Map<string, string>([
    ['ERR_NETWORK', 'Error de conexión'],
    ['ERR_AUTH_INVALID', 'Credenciales incorrectas'],
    ['ERR_AUTH_EXPIRED', 'Sesión expirada'],
    ['ERR_PERMISSION', 'No tienes permisos'],
    ['ERR_NOT_FOUND', 'Recurso no encontrado'],
    ['ERR_SERVER', 'Error del servidor'],
    ['ERR_VALIDATION', 'Datos inválidos'],
  ]);

  /**
   * Maneja cualquier tipo de error de la aplicación.
   *
   * Detecta automáticamente el tipo de error (HttpErrorResponse, Error custom, etc.)
   * y lo convierte en un AppError con mensaje legible.
   *
   * @param error - Objeto de error de cualquier tipo
   * @param duration - Tiempo en ms que se muestra el error (0 = permanente)
   *
   * @example
   * this.http.post(...).subscribe({
   *   error: (err) => this.errorService.handleError(err)
   * });
   */
  handleError(error: any, duration: number = 5000) {
    const appError = this.parseError(error);
    this.currentError.set(appError);

    if (duration > 0) {
      setTimeout(() => this.clearError(), duration);
    }
  }

  /**
   * Establece un error manualmente con mensaje y tipo específicos.
   *
   * Útil para errores personalizados del dominio de negocio que no provienen
   * de llamadas HTTP.
   *
   * @param message - Mensaje de error legible para el usuario
   * @param type - Tipo de error (AUTH, NETWORK, VALIDATION, SERVER, UNKNOWN)
   * @param duration - Tiempo en ms que se muestra el error (0 = permanente)
   *
   * @example
   * this.errorService.setError('Usuario o contraseña incorrectos', ErrorType.AUTH);
   */
  setError(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    duration: number = 5000
  ) {
    const appError: AppError = {
      type,
      message,
      timestamp: new Date(),
    };
    this.currentError.set(appError);

    if (duration > 0) {
      setTimeout(() => this.clearError(), duration);
    }
  }

  /**
   * Determina el tipo de error y lo convierte a AppError.
   *
   * Estrategia de parseo:
   * 1. Si es HttpErrorResponse → usa parseHttpError()
   * 2. Si tiene propiedad 'code' → busca en errorMap
   * 3. Caso contrario → retorna error desconocido
   *
   * @param error - Error de cualquier tipo
   * @returns AppError con tipo, mensaje y metadata
   */
  private parseError(error: any): AppError {
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error);
    }

    if (error?.code) {
      return {
        type: this.getErrorType(error.code),
        message: this.errorMap.get(error.code) || error.message,
        code: error.code,
        originalError: error,
        timestamp: new Date(),
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || 'Error desconocido',
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Convierte errores HTTP en objetos AppError con tipo y mensaje apropiados.
   *
   * Mapeo de códigos HTTP:
   * - 400 → VALIDATION: "Datos inválidos"
   * - 401 → AUTH: "Credenciales incorrectas"
   * - 403 → AUTH: "No tienes permisos"
   * - 404 → NETWORK: "Recurso no encontrado"
   * - 500 → SERVER: "Error del servidor"
   * - 0 → NETWORK: "Error de conexión"
   *
   * @param error - HttpErrorResponse de Angular
   * @returns AppError con código HTTP_{status}
   */
  private parseHttpError(error: HttpErrorResponse): AppError {
    const statusMap: Record<number, { type: ErrorType; message: string }> = {
      400: { type: ErrorType.VALIDATION, message: 'Datos inválidos' },
      401: { type: ErrorType.AUTH, message: 'Credenciales incorrectas' },
      403: { type: ErrorType.AUTH, message: 'No tienes permisos' },
      404: { type: ErrorType.NETWORK, message: 'Recurso no encontrado' },
      500: { type: ErrorType.SERVER, message: 'Error del servidor' },
      0: { type: ErrorType.NETWORK, message: 'Error de conexión' },
    };

    const errorInfo = statusMap[error.status] || {
      type: ErrorType.UNKNOWN,
      message: 'Error inesperado',
    };

    return {
      ...errorInfo,
      code: `HTTP_${error.status}`,
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Determina el tipo de error basándose en el prefijo del código.
   *
   * Convenciones de prefijos:
   * - ERR_AUTH* → ErrorType.AUTH
   * - ERR_NETWORK* → ErrorType.NETWORK
   * - ERR_VALIDATION* → ErrorType.VALIDATION
   * - ERR_SERVER* → ErrorType.SERVER
   * - Otro → ErrorType.UNKNOWN
   *
   * @param code - Código de error personalizado
   * @returns Tipo de error correspondiente
   */
  private getErrorType(code: string): ErrorType {
    if (code.startsWith('ERR_AUTH')) return ErrorType.AUTH;
    if (code.startsWith('ERR_NETWORK')) return ErrorType.NETWORK;
    if (code.startsWith('ERR_VALIDATION')) return ErrorType.VALIDATION;
    if (code.startsWith('ERR_SERVER')) return ErrorType.SERVER;
    return ErrorType.UNKNOWN;
  }

  /**
   * Limpia el error actual inmediatamente.
   *
   * Típicamente llamado cuando el usuario cierra manualmente el toast
   * o cuando se auto-limpia después del duration.
   */
  clearError() {
    this.currentError.set(null);
  }

  /**
   * Registra dinámicamente un nuevo código de error con su mensaje.
   *
   * Permite extender el errorMap en tiempo de ejecución sin modificar
   * el código del servicio.
   *
   * @param code - Código de error único
   * @param message - Mensaje legible para el usuario
   *
   * @example
   * this.errorService.registerErrorMessage('ERR_QUOTA_EXCEEDED', 'Has superado tu cuota');
   */
  registerErrorMessage(code: string, message: string) {
    this.errorMap.set(code, message);
  }
}
