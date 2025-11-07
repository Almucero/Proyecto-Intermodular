import { Injectable, signal } from '@angular/core';
import { Credentials } from '../models/credentials';

export interface User extends Credentials {
  name?: string;
  surname?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageAuthService {
  private readonly USERS_KEY = 'REGISTERED_USERS';
  private readonly AUTH_KEY = 'AUTHENTICATION';

  public user = signal<User | null>(null);

  constructor() {
    const authData = localStorage.getItem(this.AUTH_KEY);
    if (authData) {
      const credentials = JSON.parse(authData) as Credentials;
      this.validateAndSetUser(credentials);
    }
  }

  register(userData: User): boolean {
    const users = this.getRegisteredUsers();
    if (users.some((u) => u.email === userData.email)) {
      return false;
    }
    users.push(userData);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return true;
  }

  login(credentials: Credentials): boolean {
    const isValid = this.validateAndSetUser(credentials);
    if (isValid) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(credentials));
    }
    return isValid;
  }

  logout() {
    localStorage.removeItem(this.AUTH_KEY);
    this.user.set(null);
  }

  private validateAndSetUser(credentials: Credentials): boolean {
    const users = this.getRegisteredUsers();
    const user = users.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      this.user.set(user);
      return true;
    }
    return false;
  }

  private getRegisteredUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
}

//hacer resolve y reject con promise para login, con httpresponse (200, 401) (... : Promise<HTTPResponse>)
//onSubmit en login, ahora async y con await y try catch
//(mas todos los cambios que implique)
