import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseAuthenticationService } from './base-authentication.service';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import {
  AUTH_MAPPING_TOKEN,
  AUTH_SIGN_IN_API_URL_TOKEN,
  AUTH_SIGN_UP_API_URL_TOKEN,
  AUTH_ME_API_URL_TOKEN,
} from '../../repositories/repository.tokens';

@Injectable({
  providedIn: 'root',
})
export class NodeAuthenticationService extends BaseAuthenticationService {
  private readonly AUTH_KEY = 'AUTH_TOKEN';
  private rememberMeActive = false;
  private isBrowser: boolean;

  constructor(
    protected http: HttpClient,
    @Inject(AUTH_MAPPING_TOKEN) protected override authMapping: IAuthMapping,
    @Inject(AUTH_SIGN_IN_API_URL_TOKEN) protected signInUrl: string,
    @Inject(AUTH_SIGN_UP_API_URL_TOKEN) protected signUpUrl: string,
    @Inject(AUTH_ME_API_URL_TOKEN) protected meUrl: string,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    super(authMapping);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  public autoLogin() {
    if (!this.isBrowser) {
      this._ready.next(true);
      return;
    }
    const token = localStorage.getItem(this.AUTH_KEY);

    if (token) {
      this.me().subscribe({
        next: () => {
          this._ready.next(true);
        },
        error: () => {
          this.signOut();
          this._ready.next(true);
        },
      });
    } else {
      this._ready.next(true);
    }
  }

  public getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return (
      localStorage.getItem(this.AUTH_KEY) ||
      sessionStorage.getItem(this.AUTH_KEY)
    );
  }

  signIn(authPayload: any, rememberMe: boolean = false): Observable<any> {
    const payload = this.authMapping.signInPayload(authPayload);
    return this.http.post(this.signInUrl, payload).pipe(
      tap((response: any) => {
        this.saveToken(response.token, rememberMe);
        this._authenticated.next(true);
        this._user.next(this.authMapping.signIn(response));
      }),
    );
  }

  signUp(registerPayload: any): Observable<any> {
    const payload = this.authMapping.signUpPayload(registerPayload);
    return this.http.post(this.signUpUrl, payload).pipe(
      tap((response: any) => {
        this.saveToken(response.token, false);
        this._authenticated.next(true);
        this._user.next(this.authMapping.signUp(response));
      }),
    );
  }

  signOut(): Observable<any> {
    if (this.isBrowser) {
      localStorage.removeItem(this.AUTH_KEY);
      sessionStorage.removeItem(this.AUTH_KEY);
    }
    this._authenticated.next(false);
    this._user.next(undefined);
    return new Observable((observer) => {
      observer.next(true);
      observer.complete();
    });
  }

  me(): Observable<any> {
    const token = this.getToken();
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.get(this.meUrl, { headers }).pipe(
      map((res) => this.authMapping.me(res)),
      tap((user) => {
        this._authenticated.next(true);
        this._user.next(user);
      }),
    );
  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      const user = this._user.getValue();
      if (user) {
        resolve(user);
      } else {
        this.me().subscribe({
          next: (user) => resolve(user),
          error: (err) => reject(err),
        });
      }
    });
  }

  private saveToken(token: string, rememberMe: boolean) {
    if (!this.isBrowser) {
      return;
    }
    this.rememberMeActive = rememberMe;
    if (rememberMe) {
      localStorage.setItem(this.AUTH_KEY, token);
    } else {
      sessionStorage.setItem(this.AUTH_KEY, token);
    }
  }
}
