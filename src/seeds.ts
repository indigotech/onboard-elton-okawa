import 'reflect-metadata';
import * as dotenv from 'dotenv-flow';
dotenv.config();

import { getConnection } from 'typeorm';

import { startServer } from 'src/server';
import { addDummyUserOnDb } from 'test/addDummyUserOnDb';

const NUMBER_OF_USERS = 50;

const performSeed = async () => {
  console.log(process.env.NODE_ENV);
  let httpServer = await startServer();
  
  await populateUsers();

  await getConnection().close();
  httpServer.close();
};

const populateUsers = async () => {
  for(let i = 0; i < NUMBER_OF_USERS; i++) {
    let user = await addDummyUserOnDb();
    console.info(`Added user ${user.name} to database`);
  }
};

performSeed();
