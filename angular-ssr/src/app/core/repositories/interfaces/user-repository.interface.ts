import { User } from '../../models/user.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz de repositorio para operaciones de datos relacionadas con el usuario.
 */
export interface IUserRepository extends IBaseRepository<User> {}
