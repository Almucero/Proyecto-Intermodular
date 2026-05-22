/**
 * @file: src/app/core/services/interfaces/auth-mapping.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para los servicios de mapeo de autenticación.
 */

import { SignInPayload, SignUpPayload, User } from '../../models/user.model';

/**
 * Interfaz que define las operaciones de transformación de datos de autenticación.
 */
export interface IAuthMapping {
  /** Transforma el payload de login. */
  signInPayload(payload: SignInPayload): any;
  /** Transforma el payload de registro. */
  signUpPayload(payload: SignUpPayload): any;
  /** Mapea respuesta de login a User. */
  signIn(response: any): User;
  /** Mapea respuesta de registro a User. */
  signUp(response: any): User;
  /** Mapea respuesta de perfil a User. */
  me(response: any): User;
}
