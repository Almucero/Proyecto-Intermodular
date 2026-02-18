import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ChatSession,
  ChatResponse,
  SendMessagePayload,
} from '../../models/chat.model';
import { IChatService } from '../interfaces/chat-service.interface';
import { BaseService } from './base-service.service';
import { BaseAuthenticationService } from './base-authentication.service';
import {
  CHAT_API_URL_TOKEN,
  CHAT_REPOSITORY_TOKEN,
  API_URL_TOKEN,
} from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService
  extends BaseService<ChatSession>
  implements IChatService
{
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) repository: IBaseRepository<ChatSession>,
    private http: HttpClient,
    @Inject(CHAT_API_URL_TOKEN) private chatApiUrl: string,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    private auth: BaseAuthenticationService,
  ) {
    super(repository);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getSessions(): Observable<ChatSession[]> {
    return this.repository.getAll({});
  }

  getSession(id: number): Observable<ChatSession> {
    return this.repository.getById(id.toString()) as Observable<ChatSession>;
  }

  deleteSession(id: number): Observable<{ deleted: boolean }> {
    return this.repository
      .delete(id.toString())
      .pipe(map(() => ({ deleted: true })));
  }

  sendMessage(payload: SendMessagePayload): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.chatApiUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }
}
