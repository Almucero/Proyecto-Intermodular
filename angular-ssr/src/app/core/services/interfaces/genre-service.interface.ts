/**
 * @file: src/app/core/services/interfaces/genre-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de géneros.
 */

import { Genre } from '../../models/genre.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de géneros.
 */
export interface IGenreService extends IBaseService<Genre> { }
