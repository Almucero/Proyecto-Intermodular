/**
 * @file: src/app/core/repositories/interfaces/genre-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de géneros de videojuegos.
 */

import { Genre } from '../../models/genre.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de géneros de videojuegos.
 */
export interface IGenreRepository extends IBaseRepository<Genre> { }
