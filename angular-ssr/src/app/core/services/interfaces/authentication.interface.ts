/**
 * @file: src/app/core/services/interfaces/authentication.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el sistema de autenticación de usuarios.
 */

import { Observable } from 'rxjs';

/**
 * Interfaz que define el contrato para el sistema de autenticación.
 */
export interface IAuthentication {
  /** Inicia sesión. */
  signIn(authPayload: any, rememberMe?: boolean): Observable<any>;
  /** Registra usuario. */
  signUp(registerPayload: any): Observable<any>;
  /** Inicia sesión o registro con Google. */
  signInWithGoogle(idToken: string, rememberMe?: boolean): Observable<any>;
  /** Inicia sesión o registro con GitHub. */
  signInWithGithub(code: string, rememberMe?: boolean): Observable<any>;
  /** Solicita el envío de correo para recuperación de contraseña. */
  requestPasswordRecovery(email: string, locale: string): Observable<any>;
  /** Valida el código OTP de recuperación de contraseña. */
  verifyPasswordRecovery(email: string, code: string): Observable<any>;
  /** Restablece la contraseña por una nueva utilizando el código validado. */
  resetPasswordRecovery(
    email: string,
    code: string,
    newPassword: string,
  ): Observable<any>;
  /** Cierra sesión. */
  signOut(): Observable<any>;
  /** Obtiene perfil. */
  me(): Observable<any>;
  /** Obtiene usuario actual asíncronamente. */
  getCurrentUser(): Promise<any>;
  /** Obtiene el token JWT. */
  getToken(): string | null;
}
