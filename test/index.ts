import 'reflect-metadata';
import * as dotenv from 'dotenv-flow';
dotenv.config();

import * as supertest from 'supertest';
import { getConnection } from 'typeorm';

import { startServer } from '../src/server';
import loginTest from './Login.test';
import helloTest from './Hello.test';

before(async function() {
  await startServer();
  this.request = supertest('http://localhost:4000');
  this.connection = await getConnection();
});

describe('Query', helloTest.bind(this));
describe('Mutation', loginTest.bind(this));