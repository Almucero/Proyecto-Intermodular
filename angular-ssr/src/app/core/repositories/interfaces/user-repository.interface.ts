import { User } from '../../models/user.model';
import { IBaseRepository } from './base-repository.interface';

export interface IUserRepository extends IBaseRepository<User> {}
