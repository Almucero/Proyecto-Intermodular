import { Inject, Injectable } from '@angular/core';
import { GAME_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Game } from '../../models/game.model';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root',
})
export class GameService extends BaseService<Game> {
  constructor(
    @Inject(GAME_REPOSITORY_TOKEN) repository: IBaseRepository<Game>
  ) {
    super(repository);
  }
  // Métodos específicos si los hay
}
