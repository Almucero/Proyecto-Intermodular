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
  constructor() {}

  /**
   * Prepara el payload para el inicio de sesión.
   * @param payload Datos de entrada del formulario.
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
   * Genera un ID de cuenta aleatorio.
   */
  private generateAccountId(): string {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  }

  /**
   * Mapea la respuesta de login al modelo User.
   */
  signIn(response: any): User {
    return this.mapUser(response.user);
  }

  /**
   * Mapea la respuesta de registro al modelo User.
   */
  signUp(response: any): User {
    return this.mapUser(response.user);
  }

  /**
   * Mapea el perfil del usuario al modelo User.
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
