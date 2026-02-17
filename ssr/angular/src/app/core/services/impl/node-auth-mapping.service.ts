import { Injectable } from '@angular/core';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { SignInPayload, SignUpPayload, User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class NodeAuthMappingService implements IAuthMapping {
  constructor() {}

  signInPayload(payload: SignInPayload): any {
    return {
      email: payload.email,
      password: payload.password,
    };
  }

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

  private generateAccountId(): string {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  }

  signIn(response: any): User {
    return this.mapUser(response.user);
  }

  signUp(response: any): User {
    return this.mapUser(response.user);
  }

  me(response: any): User {
    return this.mapUser(response);
  }

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
