import { Model } from './base.model';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  games?: GameResult[];
}

export interface ChatSession extends Model {
  userId?: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: ChatMessage[];
  _count?: { messages: number };
}

export interface GameResult {
  id: number;
  title: string;
  price: string;
  genres: string;
  platforms: string;
}

export interface ChatResponse {
  sessionId: number;
  text: string;
  games: GameResult[];
}

export interface SendMessagePayload {
  message: string;
  sessionId?: number;
}
