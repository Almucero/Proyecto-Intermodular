/**
 * @file: src/app/core/services/impl/game.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio para la gestión de videojuegos.
 */

import { Inject, Injectable } from '@angular/core';
import { GAME_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Game } from '../../models/game.model';
import { BaseService } from './base-service.service';
import { IGameService } from '../interfaces/game-service.interface';

/**
 * Servicio para la gestión de videojuegos.
 * Extiende de {@link BaseService} para ofrecer operaciones CRUD sobre juegos.
 */
@Injectable({
  providedIn: 'root',
})
export class GameService extends BaseService<Game> implements IGameService {
  /**
   * Documentado.
   * @param repository Repositorio de videojuegos inyectado.
   */
  constructor(
    @Inject(GAME_REPOSITORY_TOKEN) repository: IBaseRepository<Game>,
  ) {
    super(repository);
  }
}
