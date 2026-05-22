/**
 * @file: src/app/core/repositories/interfaces/user-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de usuarios.
 */

import { User } from '../../models/user.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz de repositorio para operaciones de datos relacionadas con el usuario.
 */
export interface IUserRepository extends IBaseRepository<User> { }
