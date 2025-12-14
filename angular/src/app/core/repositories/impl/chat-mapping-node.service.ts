import { Injectable } from '@angular/core';
import { IBaseMapping } from '../interfaces/base-mapping.interface';
import { ChatSession, ChatMessage } from '../../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatMappingNodeService implements IBaseMapping<ChatSession> {
  getAll(data: any): ChatSession[] {
    return data.map((item: any) => this.getOne(item));
  }

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

  private mapMessage(data: any): ChatMessage {
    return {
      id: data.id,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt,
      games: data.games,
    };
  }

  getAdded(data: any): ChatSession {
    return this.getOne(data);
  }

  getUpdated(data: any): ChatSession {
    return this.getOne(data);
  }

  getDeleted(data: any): ChatSession {
    return this.getOne(data);
  }

  setAdd(data: ChatSession): any {
    return {
      title: data.title,
    };
  }

  setUpdate(data: any): any {
    return {
      title: data.title,
    };
  }
}
