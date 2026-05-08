import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { User } from '../../models/user.model';

/**
 * Servicio de mapeo para usuarios desde un backend Node.js.
 * Maneja propiedades computadas como el nombre de usuario y la imagen de perfil.
 */
@Injectable({
  providedIn: 'root',
})
export class UserMappingNodeService implements IBaseMapping<User> {
  /** Constructor no documentado. */
    constructor() {}

  /**
     * Transforma una lista de usuarios de la API.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): User[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma un objeto usuario de la API al modelo {@link User}.
   * Define getters dinámicos para `profileImage` y `username` para compatibilidad.
   * @param data Objeto de la API.
     * @returns Retorno no documentado.
     */
  getOne(data: any): User {
    const user: any = {
      id: data.id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      nickname: data.nickname,
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
      passwordHash: data.passwordHash || '',
      media: data.media,
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

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getAdded(data: any): User {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): User {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): User {
    return this.getOne(data);
  }

  /**
     * Prepara un nuevo usuario para el registro.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: User): any {
    return {
      name: data.name,
      surname: data.surname,
      email: data.email,
      nickname: data.nickname,
      password: (data as any).password,
      isAdmin: data.isAdmin,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      region: data.region,
      postalCode: data.postalCode,
      country: data.country,
    };
  }

  /**
     * Prepara los datos para actualizar el perfil del usuario.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.surname !== undefined) payload.surname = data.surname;
    if (data.email !== undefined) payload.email = data.email;
    if (data.nickname !== undefined) payload.nickname = data.nickname;
    if (data.addressLine1 !== undefined)
      payload.addressLine1 = data.addressLine1;
    if (data.addressLine2 !== undefined)
      payload.addressLine2 = data.addressLine2;
    if (data.city !== undefined) payload.city = data.city;
    if (data.region !== undefined) payload.region = data.region;
    if (data.postalCode !== undefined) payload.postalCode = data.postalCode;
    if (data.country !== undefined) payload.country = data.country;
    if (data.emailNotificationsEnabled !== undefined)
      payload.emailNotificationsEnabled = data.emailNotificationsEnabled;
    if (data.notificationEmail !== undefined)
      payload.notificationEmail = data.notificationEmail;
    if (data.emailNotificationLanguage !== undefined)
      payload.emailNotificationLanguage = data.emailNotificationLanguage;
    if (data.emailNotificationFrequency !== undefined)
      payload.emailNotificationFrequency = data.emailNotificationFrequency;
    if (data.emailNotificationTopics !== undefined)
      payload.emailNotificationTopics = data.emailNotificationTopics;
    if (data.emailNotificationPausedUntil !== undefined)
      payload.emailNotificationPausedUntil = data.emailNotificationPausedUntil;
    if (data.emailQuietHoursStart !== undefined)
      payload.emailQuietHoursStart = data.emailQuietHoursStart;
    if (data.emailQuietHoursEnd !== undefined)
      payload.emailQuietHoursEnd = data.emailQuietHoursEnd;
    if (data.emailRecommendationIntervalDays !== undefined)
      payload.emailRecommendationIntervalDays =
        data.emailRecommendationIntervalDays;

    return payload;
  }
}
