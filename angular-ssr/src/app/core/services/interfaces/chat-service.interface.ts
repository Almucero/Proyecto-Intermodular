import { Observable } from 'rxjs';
import {
  ChatSession,
  ChatResponse,
  SendMessagePayload,
} from '../../models/chat.model';

export interface IChatService {
  getSessions(): Observable<ChatSession[]>;
  getSession(id: number): Observable<ChatSession>;
  deleteSession(id: number): Observable<{ deleted: boolean }>;
  sendMessage(payload: SendMessagePayload): Observable<ChatResponse>;
}
