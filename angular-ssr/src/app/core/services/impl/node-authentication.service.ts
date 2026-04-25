import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseAuthenticationService } from './base-authentication.service';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, retry, tap, throwError, timer } from 'rxjs';
import {
  AUTH_MAPPING_TOKEN,
  AUTH_SIGN_IN_API_URL_TOKEN,
  AUTH_SIGN_UP_API_URL_TOKEN,
  AUTH_ME_API_URL_TOKEN,
} from '../../repositories/repository.tokens';

@Injectable({
  providedIn: 'root',
})
export class NodeAuthenticationService extends BaseAuthenticationService {
  private readonly AUTH_KEY = 'AUTH_TOKEN';
  private isBrowser: boolean;
  private autoLoginStarted = false;

  /**
   * @param http Cliente HTTP para realizar peticiones.
   * @param authMapping Mapeador para adaptar respuestas de la API.
   * @param signInUrl URL del endpoint de inicio de sesión.
   * @param signUpUrl URL del endpoint de registro.
   * @param meUrl URL del endpoint para obtener el perfil del usuario actual.
   * @param platformId ID de la plataforma (Browser/Server).
   */
  constructor(
    protected http: HttpClient,
    @Inject(AUTH_MAPPING_TOKEN) protected override authMapping: IAuthMapping,
    @Inject(AUTH_SIGN_IN_API_URL_TOKEN) protected signInUrl: string,
    @Inject(AUTH_SIGN_UP_API_URL_TOKEN) protected signUpUrl: string,
    @Inject(AUTH_ME_API_URL_TOKEN) protected meUrl: string,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
  ) {
    super(authMapping);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Intenta recuperar la sesión del usuario al cargar la aplicación.
   * Si existe un token válido, obtiene los datos del usuario.
   */
  public autoLogin(startDelayMs: number = 0) {
    if (this.autoLoginStarted) {
      return;
    }
    this.autoLoginStarted = true;

    if (!this.isBrowser) {
      this._ready.next(true);
      return;
    }

    const runAutoLogin = () => {
      const token = this.getToken();
      if (!token) {
        this._ready.next(true);
        return;
      }

      this.ngZone.runOutsideAngular(() => {
        this.me()
          .pipe(
            retry({
              count: 5,
              delay: (error, retryCount) => {
                const httpError = error as HttpErrorResponse;
                const isTransientError = httpError?.status === 0 || httpError?.status >= 500;
                if (!isTransientError) {
                  return throwError(() => error);
                }
                const retryDelayMs = Math.min(500 * 2 ** (retryCount - 1), 8000);
                return timer(retryDelayMs);
              },
            }),
          )
          .subscribe({
            next: () => {
              this.ngZone.run(() => {
                this._ready.next(true);
              });
            },
            error: (error) => {
              this.ngZone.run(() => {
                const httpError = error as HttpErrorResponse;
                if (httpError?.status === 401 || httpError?.status === 403) {
                  this.signOut();
                } else {
                  this._authenticated.next(false);
                  this._user.next(undefined);
                }
                this._ready.next(true);
              });
            },
          });
        });
    };

    if (startDelayMs > 0) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(runAutoLogin, startDelayMs);
      });
      return;
    }
    runAutoLogin();
  }

  /**
   * Recupera el token JWT almacenado.
   * @returns El token o null si no existe o no se está en el navegador.
   */
  public getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return (
      localStorage.getItem(this.AUTH_KEY) ||
      sessionStorage.getItem(this.AUTH_KEY)
    );
  }

  /**
   * Realiza el inicio de sesión.
   * @param authPayload Datos de acceso (email, password).
   * @param rememberMe Si es true, el token se guarda en localStorage (permanente).
   */
  signIn(authPayload: any, rememberMe: boolean = false): Observable<any> {
    const payload = this.authMapping.signInPayload(authPayload);
    return this.http.post(this.signInUrl, payload).pipe(
      tap((response: any) => {
        this.saveToken(response.token, rememberMe);
        this._authenticated.next(true);
        this._user.next(this.authMapping.signIn(response));
      }),
    );
  }

  signInWithGoogle(idToken: string, rememberMe: boolean = false): Observable<any> {
    const googleSignInUrl = this.signInUrl.replace(/\/login$/, '/google');
    return this.http.post(googleSignInUrl, { idToken }).pipe(
      tap((response: any) => {
        this.saveToken(response.token, rememberMe);
        this._authenticated.next(true);
        this._user.next(this.authMapping.signIn(response));
      }),
    );
  }

  signInWithGithub(code: string, rememberMe: boolean = false): Observable<any> {
    const githubSignInUrl = this.signInUrl.replace(/\/login$/, '/github');
    return this.http.post(githubSignInUrl, { code }).pipe(
      tap((response: any) => {
        this.saveToken(response.token, rememberMe);
        this._authenticated.next(true);
        this._user.next(this.authMapping.signIn(response));
      }),
    );
  }

  /**
   * Registra un nuevo usuario en la plataforma.
   * @param registerPayload Datos del registro.
   */
  signUp(registerPayload: any): Observable<any> {
    const payload = this.authMapping.signUpPayload(registerPayload);
    return this.http.post(this.signUpUrl, payload).pipe(
      tap((response: any) => {
        this.saveToken(response.token, false);
        this._authenticated.next(true);
        this._user.next(this.authMapping.signUp(response));
      }),
    );
  }

  /**
   * Cierra la sesión y limpia el almacenamiento local.
   */
  signOut(): Observable<any> {
    if (this.isBrowser) {
      localStorage.removeItem(this.AUTH_KEY);
      sessionStorage.removeItem(this.AUTH_KEY);
    }
    this._authenticated.next(false);
    this._user.next(undefined);
    return new Observable((observer) => {
      observer.next(true);
      observer.complete();
    });
  }

  /**
   * Obtiene los datos del usuario autenticado actualmente desde la API.
   */
  me(): Observable<any> {
    const token = this.getToken();
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.get(this.meUrl, { headers }).pipe(
      map((res) => this.authMapping.me(res)),
      tap((user) => {
        this._authenticated.next(true);
        this._user.next(user);
      }),
    );
  }

  /**
   * Devuelve el usuario actual en una Promesa.
   */
  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      const user = this._user.getValue();
      if (user) {
        resolve(user);
      } else {
        this.me().subscribe({
          next: (user) => resolve(user),
          error: (err) => reject(err),
        });
      }
    });
  }

  /**
   * Guarda el token en el almacenamiento correspondiente.
   * @param token Token JWT recibido.
   * @param rememberMe Determina si usar localStorage o sessionStorage.
   */
  private saveToken(token: string, rememberMe: boolean) {
    if (!this.isBrowser) {
      return;
    }
    if (rememberMe) {
      localStorage.setItem(this.AUTH_KEY, token);
    } else {
      sessionStorage.setItem(this.AUTH_KEY, token);
    }
  }
}
