import { User } from '../entity/User';

export interface AuthPayload {
  user: User;
  token: string;
}

export interface CreateUserInput {
  name: string;
  password: string;
  email: string;
  birthDate: string;
  cpf: string;
}
