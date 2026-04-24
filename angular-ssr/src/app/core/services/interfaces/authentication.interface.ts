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
  /** Cierra sesión. */
  signOut(): Observable<any>;
  /** Obtiene perfil. */
  me(): Observable<any>;
  /** Obtiene usuario actual asíncronamente. */
  getCurrentUser(): Promise<any>;
  /** Obtiene el token JWT. */
  getToken(): string | null;
}
