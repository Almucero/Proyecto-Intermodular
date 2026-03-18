import { Observable } from 'rxjs';
import {
  ChatSession,
  ChatResponse,
  SendMessagePayload,
} from '../../models/chat.model';

/**
 * Interfaz que define el contrato para el servicio de chat.
 */
export interface IChatService {
  /** Recupera las sesiones. */
  getSessions(): Observable<ChatSession[]>;
  /** Recupera una sesión por ID. */
  getSession(id: number): Observable<ChatSession>;
  /** Elimina una sesión. */
  deleteSession(id: number): Observable<{ deleted: boolean }>;
  /** Envía un mensaje. */
  sendMessage(payload: SendMessagePayload): Observable<ChatResponse>;
}
