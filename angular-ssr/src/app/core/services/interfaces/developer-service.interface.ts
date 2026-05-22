/**
 * @file: src/app/core/services/interfaces/developer-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de desarrolladoras.
 */

import { Developer } from '../../models/developer.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de desarrolladoras.
 */
export interface IDeveloperService extends IBaseService<Developer> { }
