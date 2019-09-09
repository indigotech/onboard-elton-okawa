import * as jwt from 'jsonwebtoken';
import * as HttpStatusCodes from 'http-status-codes';
import { expect } from 'chai';

import { addDummyUserOnDb } from "./addDummyUserOnDb";
import { APP_SECRET } from "../src/utils";
import { getRepository } from 'typeorm';
import { UserEntity } from '../src/entity/User.entity';

describe('User', function() {
  const ONE_MINUTE = 60;

  let savedUser;
  let correctToken;

  const requestUserQueryWithToken = (id: number, token: string) => {
    const { request } = this.ctx;
    return request.post('/').send({ query: `{ User(id: ${id}) { id name email birthDate cpf }}`})
      .set('Authorization', token);
  };
    
  const requestUserQuery = (id: number) => {
    const { request } = this.ctx;
    return request.post('/').send({ query: `{ User(id: ${id}) { id name email birthDate cpf }}`});
  };

  before(function() {
    this.userRepository = getRepository(UserEntity);
  });

  beforeEach(async function() {
    savedUser = await addDummyUserOnDb();
    correctToken = jwt.sign({ userId: savedUser.id }, APP_SECRET, { expiresIn: ONE_MINUTE });
  });

  afterEach(async function() {
    await this.userRepository.delete(savedUser);
  });

  it('should return own user data', async function() {
    const res = await requestUserQueryWithToken(savedUser.id, correctToken);
    
    const { id, name, email, birthDate, cpf, password } = res.body.data.User;
    expect(Number.parseInt(id)).to.be.equals(savedUser.id);
    expect(name).to.be.equals(savedUser.name);
    expect(email).to.be.equals(savedUser.email);
    expect(Number.parseInt(birthDate)).to.be.equals(new Date(savedUser.birthDate).getTime());
    expect(cpf).to.be.equals(savedUser.cpf);
    expect(password).to.be.undefined;
  });

  it('should return another user data', async function() {
    const anotherUser = await addDummyUserOnDb();
    const res = await requestUserQueryWithToken(anotherUser.id, correctToken);
    
    const { id, name, email, birthDate, cpf, password } = res.body.data.User;
    expect(Number.parseInt(id)).to.be.equals(anotherUser.id);
    expect(name).to.be.equals(anotherUser.name);
    expect(email).to.be.equals(anotherUser.email);
    expect(Number.parseInt(birthDate)).to.be.equals(new Date(anotherUser.birthDate).getTime());
    expect(cpf).to.be.equals(anotherUser.cpf);
    expect(password).to.be.undefined;

    await this.userRepository.delete(anotherUser);
  });

  it('should return null because user with id -1 does not exist', async function() {
    const res = await requestUserQueryWithToken(-1, correctToken);

    const { User } = res.body.data;
    expect(User).to.be.null;
  });

  it('should not return user because of missing auth header', async function() {
    const res = await requestUserQuery(savedUser.id);

    const { errors } = res.body;
    expect(errors).to.not.be.empty;
    expect(res.statusCode).to.be.equals(HttpStatusCodes.UNAUTHORIZED);
  });
});