import * as bcryptjs from 'bcryptjs';

import { UserEntity } from "../src/entity/User.entity";
import { getRepository } from 'typeorm';

export const addDummyUserOnDb = async (): Promise<UserEntity> => {
  const newUser: UserEntity = new UserEntity();
  newUser.name = 'name';
  newUser.email = 'email@email.com';
  newUser.birthDate = new Date(1286668800000);
  newUser.cpf = '20020020012';
  newUser.password = bcryptjs.hashSync('1234');

  return getRepository(UserEntity).save(newUser);
};