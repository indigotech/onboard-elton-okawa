import * as bcryptjs from 'bcryptjs';
import * as faker from 'faker';
import * as cpf from 'cpf';
import { getRepository } from 'typeorm';

import { UserEntity } from "src/entity/User.entity";

export const addDummyUserOnDb = async (): Promise<UserEntity> => {
  const newUser: UserEntity = getDummyUser();
  return getRepository(UserEntity).save(newUser);
};

export const addManyDummyUsersOnDb = async (numberOfUsers: number): Promise<UserEntity[]> => {
  const users: UserEntity[] = [];
  for (let i = 0; i < numberOfUsers; i++) {
    users.push(getDummyUser());
  }

  return getRepository(UserEntity).save(users);
}

const getDummyUser = (): UserEntity => {
  const newUser: UserEntity = new UserEntity();
  newUser.name = faker.name.findName();
  newUser.email = faker.internet.email();
  newUser.birthDate = faker.date.past();
  newUser.cpf = cpf.generate();
  newUser.password = bcryptjs.hashSync('1234', bcryptjs.genSaltSync(10));

  return newUser;
};