import 'reflect-metadata';
import * as dotenv from 'dotenv-flow';
dotenv.config();

import { getConnection } from 'typeorm';

import { startServer } from 'src/server';
import { addManyDummyUsersOnDb } from 'test/addDummyUserOnDb';
import { UserEntity } from 'src/entity/User.entity';

const NUMBER_OF_USERS = 50;

const performSeed = async () => {
  let httpServer = await startServer();

  await populateUsers();

  await getConnection().close();
  httpServer.close();
};

const populateUsers = async () => {
  const addedUsers = await addManyDummyUsersOnDb(NUMBER_OF_USERS);
  addedUsers.forEach((user: UserEntity) => console.info(`Added user ${user.name}`));
};

performSeed();
