import * as bcryptjs from 'bcryptjs';
import * as faker from 'faker';
import * as cpf from 'cpf';

import { UserEntity } from "../src/entity/User.entity";
import { getRepository } from 'typeorm';

export const addDummyUserOnDb = async (): Promise<UserEntity> => {
  const newUser: UserEntity = new UserEntity();
  newUser.name = faker.name.findName();
  newUser.email = faker.internet.email();
  newUser.birthDate = faker.date.past();
  newUser.cpf = cpf.generate();
  newUser.password = bcryptjs.hashSync('1234');

  return getRepository(UserEntity).save(newUser);
};