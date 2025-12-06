import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserMappingNodeService implements IBaseMapping<User> {
  constructor() {}

  getAll(data: any): User[] {
    return data.map((item: any) => this.getOne(item));
  }

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

  getAdded(data: any): User {
    return this.getOne(data);
  }

  getUpdated(data: any): User {
    return this.getOne(data);
  }

  getDeleted(data: any): User {
    return this.getOne(data);
  }

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

    return payload;
  }
}
