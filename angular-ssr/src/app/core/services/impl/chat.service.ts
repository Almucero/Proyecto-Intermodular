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

/**
 * Servicio para la gestión del chat de soporte o asistencia.
 * Maneja sesiones de chat y envío de mensajes a la API de IA o soporte.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService
  extends BaseService<ChatSession>
  implements IChatService
{
  /**
   * @param repository Repositorio para persistencia de sesiones.
   * @param http Cliente HTTP.
   * @param chatApiUrl URL de la API del chat (IA).
   * @param apiUrl URL base de la API.
   * @param auth Servicio de autenticación.
   */
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) repository: IBaseRepository<ChatSession>,
    private http: HttpClient,
    @Inject(CHAT_API_URL_TOKEN) private chatApiUrl: string,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    private auth: BaseAuthenticationService,
  ) {
    super(repository);
  }

  /**
   * Crea las cabeceras de autorización necesarias.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /**
   * Obtiene todas las sesiones de chat del usuario.
   */
  getSessions(): Observable<ChatSession[]> {
    return this.repository.getAll({});
  }

  /**
   * Obtiene el detalle de una sesión específica.
   * @param id ID de la sesión.
   */
  getSession(id: number): Observable<ChatSession> {
    return this.repository.getById(id.toString()) as Observable<ChatSession>;
  }

  /**
   * Elimina una sesión de chat.
   */
  deleteSession(id: number): Observable<{ deleted: boolean }> {
    return this.repository
      .delete(id.toString())
      .pipe(map(() => ({ deleted: true })));
  }

  /**
   * Envía un mensaje a la IA o servicio de chat.
   * @param payload Contenido del mensaje y metadatos de la sesión.
   */
  sendMessage(payload: SendMessagePayload): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.chatApiUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }
}
