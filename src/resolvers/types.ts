import { User } from '../entity/User';

export interface AuthPayload {
  user: User;
  token: string;
}
