/**
 * @file: src/app/core/repositories/interfaces/developer-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de desarrolladoras.
 */

import { Developer } from '../../models/developer.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de desarrolladoras.
 */
export interface IDeveloperRepository extends IBaseRepository<Developer> { }
