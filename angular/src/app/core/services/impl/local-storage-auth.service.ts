import { Injectable, signal } from '@angular/core';
import { SignInPayload } from '../../models/auth.model';

export interface User extends SignInPayload {
  name?: string;
  surname?: string;
  profileImage?: string;
  username?: string;
}

/**
 * @deprecated Use NodeAuthenticationService instead
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageAuthService {
  private readonly USERS_KEY = 'REGISTERED_USERS';
  private readonly AUTH_KEY = 'AUTHENTICATION';
  private rememberMeActive: boolean = false;

  public user = signal<User | null>(null);

  constructor() {
    // Primero verificar localStorage (para usuarios con "Recuérdame" activo)
    let authData = localStorage.getItem(this.AUTH_KEY);
    if (authData) {
      const credentials = JSON.parse(authData) as SignInPayload;
      this.validateAndSetUser(credentials);
      this.rememberMeActive = true;
    } else {
      // Si no hay en localStorage, verificar sessionStorage (sesión temporal)
      authData = sessionStorage.getItem(this.AUTH_KEY);
      if (authData) {
        const credentials = JSON.parse(authData) as SignInPayload;
        this.validateAndSetUser(credentials);
        this.rememberMeActive = false;
      }
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

  login(credentials: SignInPayload, rememberMe: boolean = false): boolean {
    const isValid = this.validateAndSetUser(credentials);
    if (isValid) {
      // Limpiar ambos storages primero
      localStorage.removeItem(this.AUTH_KEY);
      sessionStorage.removeItem(this.AUTH_KEY);

      // Guardar en el storage correspondiente
      if (rememberMe) {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(credentials));
        this.rememberMeActive = true;
      } else {
        sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(credentials));
        this.rememberMeActive = false;
      }
    }
    return isValid;
  }

  logout() {
    // Limpiar ambos storages
    localStorage.removeItem(this.AUTH_KEY);
    sessionStorage.removeItem(this.AUTH_KEY);
    this.user.set(null);
    this.rememberMeActive = false;
  }

  updateProfileImage(image: string): void {
    const currentUser = this.user();
    if (currentUser) {
      const updatedUser = { ...currentUser, profileImage: image };
      this.user.set(updatedUser);

      const users = this.getRegisteredUsers();
      const userIndex = users.findIndex((u) => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }

      // Actualizar en el storage activo
      const storage = this.rememberMeActive ? localStorage : sessionStorage;
      if (storage.getItem(this.AUTH_KEY)) {
        storage.setItem(this.AUTH_KEY, JSON.stringify(updatedUser));
      }
    }
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.user();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.user.set(updatedUser);

      const users = this.getRegisteredUsers();
      const userIndex = users.findIndex((u) => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }

      // Actualizar en el storage activo
      const storage = this.rememberMeActive ? localStorage : sessionStorage;
      if (storage.getItem(this.AUTH_KEY)) {
        storage.setItem(this.AUTH_KEY, JSON.stringify(updatedUser));
      }
    }
  }

  private validateAndSetUser(credentials: SignInPayload): boolean {
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
