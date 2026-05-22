/**
 * @file: src/app/core/services/interfaces/user-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de usuarios.
 */

import { User } from '../../models/user.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de usuarios.
 */
export interface IUserService extends IBaseService<User> { }
