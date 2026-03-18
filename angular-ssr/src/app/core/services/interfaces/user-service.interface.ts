import { User } from '../../models/user.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de usuarios.
 */
export interface IUserService extends IBaseService<User> {}
