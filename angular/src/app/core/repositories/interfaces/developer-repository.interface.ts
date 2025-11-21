import { Developer } from '../../models/developer.model';
import { IBaseRepository } from './base-repository.interface';

export interface IDeveloperRepository extends IBaseRepository<Developer> {}
