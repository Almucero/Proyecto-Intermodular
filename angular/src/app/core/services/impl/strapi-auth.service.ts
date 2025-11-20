import { Injectable, inject, signal } from '@angular/core';
import { SignInPayload } from '../../models/auth.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/auth.model';
import { firstValueFrom } from 'rxjs';

export interface LoginResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  name?: string | null;
  surname?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class StrapiAuthService {
  private readonly API = 'http://localhost:1337/api';
  private readonly TOKEN_KEY = 'STRAPI_AUTH_TOKEN';
  public user = signal<User | null>(null);
  public error = signal<string | null>(null);
  private token: string | null = null;
  private http = inject(HttpClient);

  constructor() {
    this.token = localStorage.getItem(this.TOKEN_KEY);
    if (this.token) {
      void this.me();
    }
  }

  async me(): Promise<User | null> {
    if (!this.token) return null;
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      const data = await firstValueFrom(
        this.http.get<StrapiUser>(`${this.API}/users/me`, { headers })
      );
      const user: User = {
        name: data.name ?? '',
        surname: data.surname ?? '',
        email: data.email,
      };
      this.user.set(user);
      return user;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Error fetching user');
      localStorage.removeItem(this.TOKEN_KEY);
      this.token = null;
      this.user.set(null);
      return null;
    }
  }

  async login(credentials: SignInPayload): Promise<boolean> {
    this.error.set(null);
    const body = {
      identifier: credentials.email,
      password: credentials.password,
    };
    try {
      const data = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API}/auth/local`, body)
      );
      this.token = data.jwt;
      localStorage.setItem(this.TOKEN_KEY, data.jwt);
      const newUser: User = {
        email: data.user.email,
        name: data.user.name ?? '',
        surname: data.user.surname ?? '',
      };
      this.user.set(newUser);
      return true;
    } catch (err) {
      this.error.set((err as any)?.message ?? 'Login failed');
      return false;
    }
  }

  async register(userData: any & { password: string }): Promise<boolean> {
    this.error.set(null);
    const body = {
      email: userData.email,
      username: userData.name,
      password: userData.password,
    };
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API}/auth/local/register`, body)
      );
      if (response.jwt) {
        this.token = response.jwt;
        localStorage.setItem(this.TOKEN_KEY, response.jwt);
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
        });
        await firstValueFrom(
          this.http.put<StrapiUser>(
            `${this.API}/users/${response.user.id}`,
            {
              name: userData.name,
              surname: userData.surname,
            },
            { headers }
          )
        );
        const newUser: User = {
          email: response.user.email,
          name: userData.name,
          surname: userData.surname,
        };
        this.user.set(newUser);
        return true;
      }
      return false;
    } catch (err) {
      this.error.set((err as any)?.message ?? 'Registration failed');
      return false;
    }
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token = null;
    this.user.set(null);
  }
}
