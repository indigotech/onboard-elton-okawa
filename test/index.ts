import 'reflect-metadata';
import * as dotenv from 'dotenv-flow';
dotenv.config();

import * as supertest from 'supertest';
import { expect } from 'chai';
import { getConnection } from 'typeorm';

import { startServer } from '../src/server';
import loginTest from './Login.test';

before(async function() {
  await startServer();
  this.request = supertest('http://localhost:4000');
  this.connection = await getConnection();
});

describe('Query', function() {
  describe('Hello', function() {
    it('should return hello world', function(done) {
      this.test.ctx.request.post('/').send('{ \"query\": \"{ Hello }\" }').set('content-type', 'application/json').end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.Hello).to.be.eq('Hello, world!');
        done();
      });
    });
  });
});

describe('Mutation', loginTest.bind(this));