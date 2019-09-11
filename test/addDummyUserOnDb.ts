import * as bcryptjs from 'bcryptjs';
import * as faker from 'faker';
import * as cpf from 'cpf';
import { getRepository } from 'typeorm';

import { User } from "src/entity/User.entity";

export const addDummyUserOnDb = async (): Promise<User> => {
  const newUser: User = getDummyUser();
  return getRepository(User).save(newUser);
};

export const addManyDummyUsersOnDb = async (numberOfUsers: number): Promise<User[]> => {
  const users: User[] = [];
  for (let i = 0; i < numberOfUsers; i++) {
    users.push(getDummyUser());
  }

  return getRepository(User).save(users);
}

const getDummyUser = (): User => {
  const newUser: User = new User();
  newUser.name = faker.name.findName();
  newUser.email = faker.internet.email();
  newUser.birthDate = faker.date.past();
  newUser.cpf = cpf.generate();
  newUser.password = bcryptjs.hashSync('1234', bcryptjs.genSaltSync(10));

  return newUser;
};