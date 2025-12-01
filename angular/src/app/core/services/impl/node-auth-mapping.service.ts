import { Injectable } from '@angular/core';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { SignInPayload, SignUpPayload, User } from '../../models/auth.model';

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
    };
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

  private mapUser(data: any): User {
    return {
      id: data.id,
      name: data.name,
      surname: data.surname,
      email: data.email,
    };
  }
}
