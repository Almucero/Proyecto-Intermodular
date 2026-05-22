/**
 * @file: src/app/core/repositories/interfaces/platform-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de plataformas.
 */

import { Platform } from '../../models/platform.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de plataformas.
 */
export interface IPlatformRepository extends IBaseRepository<Platform> { }
