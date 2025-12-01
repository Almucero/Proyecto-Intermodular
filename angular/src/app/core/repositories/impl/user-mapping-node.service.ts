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
    return {
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
    };
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
    };
  }

  setUpdate(data: any): any {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.surname) payload.surname = data.surname;
    if (data.email) payload.email = data.email;
    if (data.nickname) payload.nickname = data.nickname;
    if (data.addressLine1) payload.addressLine1 = data.addressLine1;
    if (data.addressLine2) payload.addressLine2 = data.addressLine2;
    if (data.city) payload.city = data.city;
    if (data.region) payload.region = data.region;
    if (data.postalCode) payload.postalCode = data.postalCode;
    if (data.country) payload.country = data.country;

    return payload;
  }
}
