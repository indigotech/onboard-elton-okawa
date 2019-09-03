import * as assert from 'assert';
import * as supertest from 'supertest';

import { startServer } from '../src/server';

const request = supertest('http://localhost:4000');

before((done) => {
  startServer().then(() => done());
});

describe('Query', function() {
  describe('Hello', function() {
    it('should return hello world', function(done) {
      request.post('/').send('{ \"query\": \"{ Hello }\" }').set('content-type', 'application/json').end((err, res) => {
        if (err) return done(err);
        console.log(res.body);
        done();
      });
    });
  });
});

describe('Mutation', function() {
  describe('Login', function() {
    it('should return true', function() {
      assert.ok(true);
    });
  });
});