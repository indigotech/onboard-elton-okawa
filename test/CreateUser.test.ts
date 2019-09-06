import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as HttpStatusCode from 'http-status-codes';
import { getRepository } from "typeorm";
import { expect } from 'chai';

import { User } from "../src/entity/User";
import { addDummyUserOnDb } from "./addDummyUserOnDb";
import { APP_SECRET } from '../src/utils';

describe('CreateUser', function() {
  let newUser = new User();
  newUser.name = "Another User";
  newUser.email = "newemail@email.com";
  newUser.cpf = "10020030040012";
  newUser.birthDate = new Date(1286668800000);
  newUser.password = "a1234567";

  let savedUser;
  let correctToken;

  const requestCreateUserMutation = async (user: User, token: string) => {
    const { request } = this.ctx;
    return request.post('/').send({
      query: `mutation { \
        CreateUser( user: { name: \"${user.name}\", email: \"${user.email}\", \
          password: \"${user.password}\", cpf: \"${user.cpf}\", birthDate: \"${user.birthDate}\"}) {\
          id name cpf email birthDate \
        }}`}).set('Authorization', token);
  };

  before(function() {
    this.userRepository = getRepository(User);
  });

  beforeEach(async function() {
    savedUser = await addDummyUserOnDb();
    const { request } = this.test.ctx;
    const loginRes = await request.post('/').send({
      query: `mutation { Login (email: \"${savedUser.email}\", password: \"1234\") { user { id } token }}`});
    correctToken = loginRes.body.data.Login.token;
  });

  afterEach(async function() {
    this.userRepository.delete(savedUser);
  });

  it('should authorize and create user', async function() {
    const res = await requestCreateUserMutation(newUser, correctToken);
        
    const { id, name, cpf, email, birthDate } = res.body.data.CreateUser;
    expect(id).to.not.be.empty;
    expect(name).to.be.equals(newUser.name);
    expect(cpf).to.be.equals(newUser.cpf);
    expect(email).to.be.equals(newUser.email);
    expect(new Date(birthDate).getTime()).to.be.equals(newUser.birthDate.getTime());

    const dbUser = await this.userRepository.findOne({ id });
    expect(dbUser.name).to.be.equals(newUser.name);
    expect(dbUser.cpf).to.be.equals(newUser.cpf);
    expect(dbUser.email).to.be.equals(newUser.email);
    expect(new Date(dbUser.birthDate).getTime()).to.be.equals(new Date(newUser.birthDate).getTime());
    expect(dbUser.password).to.not.be.equals(newUser.password);
    expect(bcryptjs.compareSync(newUser.password, dbUser.password)).to.be.true;

    await this.userRepository.delete(dbUser);
  }); 

  it('should not create user because there is no Authorization header', async function() {
    const { request } = this.test.ctx;
    const res = await request.post('/').send({
      query: `mutation { \
        CreateUser( user: { name: \"${newUser.name}\", email: \"${newUser.email}\", \
          password: \"${newUser.password}\", cpf: \"${newUser.cpf}\", birthDate: \"${newUser.birthDate}\"}) {\
          id name cpf email birthDate \
        }}`});

    const { errors } = res.body;
    expect(res.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
    expect(errors[0].message).to.be.equals('Missing Authorization Header');

    const dbUser = await this.userRepository.findOne({ email: newUser.email });
    expect(dbUser).to.be.undefined;
  });

  it('should not create user because token is expired', async function() {
    const payload = jwt.verify(correctToken, APP_SECRET) as { userId: number, iat: number, exp: number };
    const expiredToken = jwt.sign({ ...payload, iat: 100, exp: 200 }, APP_SECRET);

    const res = await requestCreateUserMutation(newUser, expiredToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals('jwt expired');

    const dbUser = await this.userRepository.findOne({ email: newUser.email });
    expect(dbUser).to.be.undefined;
  });

  it('should not create user because of invalid signature', async function() {
    const payload = jwt.verify(correctToken, APP_SECRET) as { userId: number, iat: number, exp: number };
    const invalidSignatureToken = jwt.sign({ ...payload }, 'wrong signature');

    const res = await requestCreateUserMutation(newUser, invalidSignatureToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals('invalid signature');

    const dbUser = await this.userRepository.findOne({ email: newUser.email });
    expect(dbUser).to.be.undefined;
  });

  it('should not create user because there is no logged userId on token payload', async function() {
    const payload = jwt.verify(correctToken, APP_SECRET) as { userId: number, iat: number, exp: number };
    const tokenWithoutUserId = jwt.sign({ ...payload, userId: undefined }, APP_SECRET);

    const res = await requestCreateUserMutation(newUser, tokenWithoutUserId);

    expect(res.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals('Malformed token payload');

    const dbUser = await this.userRepository.findOne({ email: newUser.email });
    expect(dbUser).to.be.undefined;
  });
});