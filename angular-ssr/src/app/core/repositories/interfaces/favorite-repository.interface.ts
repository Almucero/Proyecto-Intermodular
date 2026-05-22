/**
 * @file: src/app/core/repositories/interfaces/favorite-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de juegos favoritos.
 */

import { Favorite } from '../../models/favorite.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de juegos favoritos.
 */
export interface IFavoriteRepository extends IBaseRepository<Favorite> { }
