import { Injectable } from '@angular/core';
import { IAuthentication } from '../interfaces/authentication.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { User } from '../../models/user.model';

/**
 * Clase base abstracta para servicios de autenticación.
 * Define el estado de autenticación del usuario y los métodos necesarios para el flujo de sesión.
 */
@Injectable({
  providedIn: 'root',
})
export abstract class BaseAuthenticationService implements IAuthentication {
  /** Indica si el usuario actual está autenticado. */
  protected _authenticated: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  /** Observable del estado de autenticación. */
  public authenticated$: Observable<boolean> =
    this._authenticated.asObservable();

  /** Información del usuario autenticado actualmente. */
  protected _user: BehaviorSubject<User | undefined> = new BehaviorSubject<
    User | undefined
  >(undefined);
  /** Observable de los datos del usuario. */
  public user$: Observable<User | undefined> = this._user.asObservable();

  /** Indica si el servicio ha terminado de inicializar (ej. tras verificar token). */
  protected _ready: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );
  /** Observable que emite true cuando el estado de autenticación es definitivo. */
  public ready$: Observable<boolean> = this._ready.asObservable();

  /**
   * @param authMapping Mapeador para transformar datos de la API al modelo de la aplicación.
   */
  constructor(protected authMapping: IAuthMapping) {}

  /** Obtiene el usuario actual de forma asíncrona. */
  abstract getCurrentUser(): Promise<any>;
  /** Inicia sesión con credenciales. */
  abstract signIn(authPayload: any, rememberMe?: boolean): Observable<any>;
  /** Registra un nuevo usuario. */
  abstract signUp(registerPayload: any): Observable<any>;
  /** Inicia sesión o alta con Google. */
  abstract signInWithGoogle(idToken: string, rememberMe?: boolean): Observable<any>;
  /** Inicia sesión o alta con GitHub. */
  abstract signInWithGithub(code: string, rememberMe?: boolean): Observable<any>;
  /** Cierra la sesión activa. */
  abstract signOut(): Observable<any>;
  /** Obtiene la información del perfil del usuario autenticado. */
  abstract me(): Observable<any>;
  /** Intenta iniciar sesión automáticamente (ej. usando un token en localStorage). */
  abstract autoLogin(): void;
  /** Recupera el token de acceso actual (JWT). */
  abstract getToken(): string | null;
}
