import { UserEntity } from '../entity/User.entity';

export interface AuthPayload {
  user: UserEntity;
  token: string;
}

export interface CreateUserInput {
  name: string;
  password: string;
  email: string;
  birthDate: string;
  cpf: string;
}
