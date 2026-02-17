import { ChatSession } from '../../models/chat.model';
import { IBaseRepository } from './base-repository.interface';

export interface IChatRepository extends IBaseRepository<ChatSession> {}
