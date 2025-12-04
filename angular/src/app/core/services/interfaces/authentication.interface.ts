import { Observable } from 'rxjs';

export interface IAuthentication {
  signIn(authPayload: any, rememberMe?: boolean): Observable<any>;
  signUp(registerPayload: any): Observable<any>;
  signOut(): Observable<any>;
  me(): Observable<any>;
  getCurrentUser(): Promise<any>;
  getToken(): string | null;
}
