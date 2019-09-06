import { User } from '../entity/User';

export interface AuthPayload {
  user: User;
  token: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  birthDate: string;
  cpf: string;
}
