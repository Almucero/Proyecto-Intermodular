import { Model } from './base.model';

/**
 * Representa un mensaje individual dentro de una sesión de chat.
 */
export interface ChatMessage {
  /** Identificador único del mensaje. */
  id?: number;
  /** Rol del emisor: usuario o asistente IA. */
  role: 'user' | 'assistant';
  /** Contenido de texto del mensaje (soporta Markdown). */
  content: string;
  /** Fecha de creación del mensaje. */
  createdAt?: string;
  /** Juegos recomendados o mencionados en este mensaje. */
  games?: GameResult[];
}

/**
 * Representa una sesión de conversación histórica entre el usuario y la IA.
 */
export interface ChatSession extends Model {
  /** ID del usuario propietario de la sesión. */
  userId?: number;
  /** Título autogenerado o asignado a la conversación. */
  title?: string;
  /** Fecha de inicio de la sesión. */
  createdAt?: string;
  /** Fecha de la última actividad. */
  updatedAt?: string;
  /** Historial completo de mensajes. */
  messages?: ChatMessage[];
  /** Metadatos adicionales como el conteo de mensajes. */
  _count?: { messages: number };
}

/**
 * Estructura simplificada de un juego devuelto por el motor de recomendaciones.
 */
export interface GameResult {
  /** ID del juego en la base de datos. */
  id: number;
  /** Título del juego. */
  title: string;
  /** Precio formateado. */
  price: string;
  /** Lista de géneros como cadena de texto. */
  genres: string;
  /** Lista de plataformas como cadena de texto. */
  platforms: string;
}

/**
 * Respuesta devuelta por la API de Chat IA.
 */
export interface ChatResponse {
  /** ID de la sesión (puede ser nueva o existente). */
  sessionId: number;
  /** Texto de respuesta generado por la IA. */
  text: string;
  /** Lista de objetos de juegos detectados en la recomendación. */
  games: GameResult[];
}

/**
 * Datos necesarios para enviar un nuevo mensaje al chat.
 */
export interface SendMessagePayload {
  /** Texto enviado por el usuario. */
  message: string;
  /** ID de la sesión existente. Si es nulo, se creará una nueva. */
  sessionId?: number;
}
