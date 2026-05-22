/**
 * @file: src/app/core/services/impl/base-authentication.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Clase base abstracta para servicios de autenticación.
 */

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
     * Inicializa la clase abstracta asignando el mapeador de autenticación.
     * @param authMapping Mapeador para transformar datos de la API al modelo de la aplicación.
     */
    constructor(protected authMapping: IAuthMapping) { }

    /**
     * Obtiene el usuario actual de forma asíncrona.
     * @returns Promesa que se resuelve con el usuario actual o se rechaza en caso de error.
     */
    abstract getCurrentUser(): Promise<any>;
    /**
     * Inicia sesión con credenciales locales.
     * @param authPayload Datos de acceso (email y password).
     * @param rememberMe Indica si la sesión debe ser persistente en el dispositivo.
     * @returns Observable que emite los datos del usuario autenticado.
     */
    abstract signIn(authPayload: any, rememberMe?: boolean): Observable<any>;
    /**
     * Registra un nuevo usuario en la aplicación.
     * @param registerPayload Datos requeridos para la creación de cuenta.
     * @returns Observable con el resultado del registro.
     */
    abstract signUp(registerPayload: any): Observable<any>;
    /**
     * Inicia sesión o da de alta un usuario mediante Google OAuth.
     * @param idToken Token de identidad provisto por Google.
     * @param rememberMe Indica si mantener la sesión tras cerrar el navegador.
     * @returns Observable con la respuesta del inicio de sesión.
     */
    abstract signInWithGoogle(idToken: string, rememberMe?: boolean): Observable<any>;
    /**
     * Inicia sesión o da de alta un usuario mediante GitHub OAuth.
     * @param code Código de autorización de GitHub.
     * @param rememberMe Indica si mantener la sesión tras cerrar el navegador.
     * @returns Observable con la respuesta del inicio de sesión.
     */
    abstract signInWithGithub(code: string, rememberMe?: boolean): Observable<any>;
    /**
     * Solicita el envío de un enlace o código de recuperación al correo indicado.
     * @param email Correo del usuario a recuperar.
     * @param locale Idioma preferido para la comunicación.
     * @returns Observable con el estado de la solicitud de recuperación.
     */
    abstract requestPasswordRecovery(email: string, locale: string): Observable<any>;
    /**
     * Verifica que el código OTP introducido por el usuario sea correcto para la cuenta indicada.
     * @param email Correo del usuario asociado.
     * @param code Código de validación OTP.
     * @returns Observable con el estado de la verificación.
     */
    abstract verifyPasswordRecovery(email: string, code: string): Observable<any>;
    /**
     * Restablece la contraseña por una nueva tras verificar el código.
     * @param email Correo del usuario asociado.
     * @param code Código verificado previamente.
     * @param newPassword Nueva contraseña elegida por el usuario.
     * @returns Observable con el resultado final de la operación.
     */
    abstract resetPasswordRecovery(
       email: string,
       code: string,
       newPassword: string,
    ): Observable<any>;
    /**
     * Cierra la sesión activa del usuario y limpia los datos.
     * @returns Observable indicando la finalización de la desconexión.
     */
    abstract signOut(): Observable<any>;
    /**
     * Obtiene la información del perfil del usuario autenticado.
     * @returns Observable que emite los datos del usuario.
     */
    abstract me(): Observable<any>;
    /**
     * Intenta iniciar sesión automáticamente al cargar la aplicación.
     * @param startDelayMs Retardo inicial opcional en milisegundos.
     */
    abstract autoLogin(startDelayMs?: number): void;
    /**
     * Recupera el token de acceso actual (JWT).
     * @returns Token de autenticación guardado, o null si no existe.
     */
    abstract getToken(): string | null;
}
