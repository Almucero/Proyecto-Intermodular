import { ChatSession } from '../../models/chat.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de sesiones de chat.
 */
export interface IChatRepository extends IBaseRepository<ChatSession> {}
