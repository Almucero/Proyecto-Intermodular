/**
 * @file: src/app/core/services/interfaces/platform-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de plataformas.
 */

import { Platform } from '../../models/platform.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de plataformas.
 */
export interface IPlatformService extends IBaseService<Platform> { }
