import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { ChatSession, ChatMessage } from '../../models/chat.model';

/**
 * Servicio de mapeo para las sesiones de chat desde un backend Node.js.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatMappingNodeService implements IBaseMapping<ChatSession> {
  /**
     * Transforma una lista de sesiones de chat de la API.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getAll(data: any): ChatSession[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
     * Transforma una sesión de chat única.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  getOne(data: any): ChatSession {
    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      messages: data.messages?.map((msg: any) => this.mapMessage(msg)) || [],
      _count: data._count,
    };
  }

  /**
     * Mapea un mensaje individual dentro de una sesión.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  private mapMessage(data: any): ChatMessage {
    return {
      id: data.id,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt,
      games: data.games,
    };
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getAdded(data: any): ChatSession {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getUpdated(data: any): ChatSession {
    return this.getOne(data);
  }

  /**
     * Método no documentado.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    getDeleted(data: any): ChatSession {
    return this.getOne(data);
  }

  /**
     * Prepara una sesión para ser creada.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setAdd(data: ChatSession): any {
    return {
      title: data.title,
    };
  }

  /**
     * Prepara los cambios para actualizar una sesión.
     * @param data Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  setUpdate(data: any): any {
    return {
      title: data.title,
    };
  }
}
