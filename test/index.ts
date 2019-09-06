import 'reflect-metadata';
import * as dotenv from 'dotenv-flow';
dotenv.config();

import * as supertest from 'supertest';
import { getConnection } from 'typeorm';

import { startServer } from '../src/server';

let httpServer;

before(async function() {
  httpServer = await startServer();
  this.request = supertest('http://localhost:4000');
});

describe('Query', () => {
 require('./Hello.test'); 
});

describe('Mutation', () => {
  require('./Login.test');
});

after(async function() {
  await getConnection().close();
  httpServer.close();
});