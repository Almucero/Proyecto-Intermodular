/**
 * @file: src/app/core/repositories/interfaces/chat-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de sesiones de chat.
 */

import { ChatSession } from '../../models/chat.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de sesiones de chat.
 */
export interface IChatRepository extends IBaseRepository<ChatSession> { }
