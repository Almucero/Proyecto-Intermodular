import { User } from '../../models/user.model';
import { IBaseService } from './base-service.interface';

export interface IUserService extends IBaseService<User> {
  // Métodos específicos si los hay
}
