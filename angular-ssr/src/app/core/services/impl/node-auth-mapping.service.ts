/**
 * @file: src/app/core/services/impl/node-auth-mapping.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio encargado de mapear los datos entre los modelos de la aplicación y las respuestas/peticiones de la API.
 */

import { Injectable } from '@angular/core';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { SignInPayload, SignUpPayload, User } from '../../models/user.model';

/**
 * Servicio encargado de mapear los datos entre los modelos de la aplicación y las respuestas/peticiones de la API.
 * Asegura que el frontend trabaje con una estructura de datos limpia y consistente.
 */
@Injectable({
  providedIn: 'root',
})
export class NodeAuthMappingService implements IAuthMapping {
  /**
   * Crea una instancia de NodeAuthMappingService.
   */
  constructor() { }

  /**
   * Prepara el payload para el inicio de sesión.
   * @param payload Datos de entrada del formulario.
   * @returns Un objeto JSON preparado para enviar a la API de login.
   */
  signInPayload(payload: SignInPayload): any {
    return {
      email: payload.email,
      password: payload.password,
    };
  }

  /**
   * Prepara el payload para el registro de un nuevo usuario.
   * Realiza transformaciones automáticas como generar el tag 'accountAt'.
   * @param payload Datos del registro.
   * @returns Un objeto JSON mapeado para enviar al endpoint de registro.
   */
  signUpPayload(payload: SignUpPayload): any {
    return {
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      password: payload.password,
      accountAt: `@${payload.name.replace(/\s+/g, '').toLowerCase()}`,
      accountId: this.generateAccountId(),
    };
  }

  /**
   * Genera un ID de cuenta aleatorio en formato hexadecimal.
   * @returns El identificador hexadecimal único autogenerado.
   */
  private generateAccountId(): string {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  }

  /**
   * Mapea la respuesta de login al modelo User.
   * @param response Respuesta JSON devuelta por la API de login.
   * @returns Instancia del modelo User mapeada.
   */
  signIn(response: any): User {
    return this.mapUser(response.user);
  }

  /**
   * Mapea la respuesta de registro al modelo User.
   * @param response Respuesta JSON devuelta por la API de registro.
   * @returns Instancia del modelo User mapeada.
   */
  signUp(response: any): User {
    return this.mapUser(response.user);
  }

  /**
   * Mapea el perfil del usuario al modelo User.
   * @param response Respuesta JSON devuelta por el endpoint 'me'.
   * @returns Instancia del modelo User mapeada.
   */
  me(response: any): User {
    return this.mapUser(response);
  }

  /**
   * Realiza el mapeo interno de los campos del usuario.
   * Define propiedades computadas como 'profileImage' y 'username'.
   * @param data Datos planos de la API.
   * @returns Objeto de tipo User.
   */
  private mapUser(data: any): any {
    const user: any = {
      id: data.id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      accountAt: data.accountAt,
      accountId: data.accountId,
      nickname: data.nickname,
      media: data.media,
      balance: data.balance,
      points: data.points,
      isAdmin: data.isAdmin,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      region: data.region,
      postalCode: data.postalCode,
      country: data.country,
      emailNotificationsEnabled: data.emailNotificationsEnabled,
      notificationEmail: data.notificationEmail,
      emailNotificationLanguage: data.emailNotificationLanguage,
      emailNotificationFrequency: data.emailNotificationFrequency,
      emailNotificationTopics: data.emailNotificationTopics,
      emailNotificationPausedUntil: data.emailNotificationPausedUntil,
      emailQuietHoursStart: data.emailQuietHoursStart,
      emailQuietHoursEnd: data.emailQuietHoursEnd,
      emailRecommendationIntervalDays: data.emailRecommendationIntervalDays,
    };

    Object.defineProperty(user, 'profileImage', {
      get() {
        return this.media && this.media.length > 0
          ? this.media[0].url
          : undefined;
      },
      enumerable: false,
      configurable: true,
    });

    Object.defineProperty(user, 'username', {
      get() {
        return this.nickname;
      },
      enumerable: false,
      configurable: true,
    });

    return user as User;
  }
}
