/**
 * @file: src/app/core/repositories/impl/chat-mapping-node.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Implementación del mapeo de entidades del chat para un backend Node.js.
 */

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
   * @param data Lista de objetos crudos de sesiones devueltos por la API.
   * @returns Listado mapeado de ChatSession.
   */
  getAll(data: any): ChatSession[] {
    return data.map((item: any) => this.getOne(item));
  }

  /**
   * Transforma una sesión de chat única.
   * @param data Objeto de sesión crudo devuelto por la API.
   * @returns Objeto ChatSession estructurado.
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
   * @param data Mensaje crudo devuelto por el backend.
   * @returns Instancia tipada de ChatMessage.
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
   * Adapta y mapea el objeto tras ser creado exitosamente.
   * @param data Objeto creado proveniente del backend.
   * @returns Sesión de chat mapeada.
   */
  getAdded(data: any): ChatSession {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el objeto tras ser actualizado exitosamente.
   * @param data Objeto modificado proveniente del backend.
   * @returns Sesión de chat mapeada.
   */
  getUpdated(data: any): ChatSession {
    return this.getOne(data);
  }

  /**
   * Adapta y mapea el objeto tras ser eliminado.
   * @param data Objeto eliminado proveniente del backend.
   * @returns Sesión de chat mapeada.
   */
  getDeleted(data: any): ChatSession {
    return this.getOne(data);
  }

  /**
   * Prepara una sesión para ser creada.
   * @param data Datos de la sesión del chat a enviar.
   * @returns Objeto serializado para el envío en POST.
   */
  setAdd(data: ChatSession): any {
    return {
      title: data.title,
    };
  }

  /**
   * Prepara los cambios para actualizar una sesión.
   * @param data Datos a actualizar en la sesión.
   * @returns Objeto con los datos serializados para PATCH.
   */
  setUpdate(data: any): any {
    return {
      title: data.title,
    };
  }
}
