import * as bcryptjs from 'bcryptjs';

import { User } from "../src/entity/User";
import { getRepository } from 'typeorm';

export const addDummyUserOnDb = async (): Promise<User> => {
  const newUser: User = new User();
  newUser.name = 'name';
  newUser.email = 'email@email.com';
  newUser.birthDate = new Date(1286668800000);
  newUser.cpf = '20020020012';
  newUser.password = bcryptjs.hashSync('1234');

  return getRepository(User).save(newUser);
};