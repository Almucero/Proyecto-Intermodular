import { Inject, Injectable } from '@angular/core';
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
  constructor(
    protected http: HttpClient,
    @Inject(AUTH_MAPPING_TOKEN) protected override authMapping: IAuthMapping,
    @Inject(AUTH_SIGN_IN_API_URL_TOKEN) protected signInUrl: string,
    @Inject(AUTH_SIGN_UP_API_URL_TOKEN) protected signUpUrl: string,
    @Inject(AUTH_ME_API_URL_TOKEN) protected meUrl: string,
  ) {
    super(authMapping);
  }

  signIn(authPayload: any): Observable<any> {
    const payload = this.authMapping.signInPayload(authPayload);
    return this.http.post(this.signInUrl, payload).pipe(
      tap((response: any) => {
        // Assuming response contains token and user
        // You might need to save token here or in an interceptor
        this._authenticated.next(true);
        this._user.next(this.authMapping.signIn(response));
      }),
    );
  }

  signUp(registerPayload: any): Observable<any> {
    const payload = this.authMapping.signUpPayload(registerPayload);
    return this.http.post(this.signUpUrl, payload).pipe(
      tap((response: any) => {
        this._authenticated.next(true);
        this._user.next(this.authMapping.signUp(response));
      }),
    );
  }

  signOut(): Observable<any> {
    // Implement sign out logic, e.g., clearing tokens
    this._authenticated.next(false);
    this._user.next(undefined);
    return new Observable((observer) => {
      observer.next(true);
      observer.complete();
    });
  }

  me(): Observable<any> {
    return this.http.get(this.meUrl).pipe(
      map((res) => this.authMapping.me(res)),
      tap((user) => {
        this._authenticated.next(true);
        this._user.next(user);
      }),
    );
  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.me().subscribe({
        next: (user) => resolve(user),
        error: (err) => reject(err),
      });
    });
  }
}
