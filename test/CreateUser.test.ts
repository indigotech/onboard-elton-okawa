import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as HttpStatusCode from 'http-status-codes';
import { getRepository } from "typeorm";
import { expect } from 'chai';
import gql from 'graphql-tag';

import * as ErrorMessages from 'src/ErrorMessages';
import { requestGraphQL, requestGraphQLWithToken } from 'test/requestGraphQL';
import { UserEntity } from "src/entity/User.entity";
import { addDummyUserOnDb } from "test/addDummyUserOnDb";
import { APP_SECRET } from 'src/utils';

describe('CreateUser', function() {
  const ONE_MINUTE = 60;

  let newUser = new UserEntity();
  newUser.name = "Another User";
  newUser.email = "newemail@email.com";
  newUser.cpf = "10020030040012";
  newUser.birthDate = new Date(1286668800000);
  newUser.password = "a1234567";

  let savedUser;
  let correctToken;

  const getCreateUserMutation = (user: UserEntity) => {
    return gql`
      mutation {
        CreateUser( user: {
          name: "${user.name}", 
          email: "${user.email}", 
          password: "${user.password}", 
          cpf: "${user.cpf}", 
          birthDate: "${user.birthDate}"}) {

          id 
          name 
          cpf 
          email 
          birthDate 
      }}`;
  };

  const requestCreateUserMutationWithToken = (user: UserEntity, token: string) => {
    const query = getCreateUserMutation(user);
    return requestGraphQLWithToken(this.ctx.request, query, token);
  };

  const requestCreateUserMutation = (user: UserEntity) => {
    const query = getCreateUserMutation(user);
    return requestGraphQL(this.ctx.request, query);
  }

  const expectNewUserToBeUndefined = async () => {
    const dbUser = await this.ctx.userRepository.findOne({ email: newUser.email });
    expect(dbUser).to.be.undefined;
  }

  const expectNumberOfUsersToBeOne = async () => {
    const numberOfUsers = await this.ctx.userRepository.count();
    expect(numberOfUsers).to.be.equals(1);
  }

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

  it('should authorize and create user', async function() {
    const res = await requestCreateUserMutationWithToken(newUser, correctToken);
        
    const { id, name, cpf, email, birthDate } = res.body.data.CreateUser;
    expect(id).to.not.be.empty;
    expect(name).to.be.equals(newUser.name);
    expect(cpf).to.be.equals(newUser.cpf);
    expect(email).to.be.equals(newUser.email);
    expect(new Date(birthDate).getTime()).to.be.equals(newUser.birthDate.getTime());

    const dbUser = await this.userRepository.findOne(id);
    expect(dbUser.name).to.be.equals(newUser.name);
    expect(dbUser.cpf).to.be.equals(newUser.cpf);
    expect(dbUser.email).to.be.equals(newUser.email);
    expect(new Date(dbUser.birthDate).getTime()).to.be.equals(new Date(newUser.birthDate).getTime());
    expect(dbUser.password).to.not.be.equals(newUser.password);
    expect(bcryptjs.compareSync(newUser.password, dbUser.password)).to.be.true;

    await this.userRepository.delete(dbUser);
  }); 

  it('should not create user because there is no Authorization header', async function() {
    const res = await requestCreateUserMutation(newUser);

    const { errors } = res.body;
    expect(res.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
    expect(errors[0].message).to.be.equals(ErrorMessages.MISSING_AUTH_HEADER);

    await expectNewUserToBeUndefined();
  });

  it('should not create user because token is expired', async function() {
    const payload = jwt.verify(correctToken, APP_SECRET) as { userId: number, iat: number, exp: number };
    const expiredToken = jwt.sign({ ...payload, iat: 100, exp: 200 }, APP_SECRET);

    const res = await requestCreateUserMutationWithToken(newUser, expiredToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.JWT_EXPIRED);

    await expectNewUserToBeUndefined();
  });

  it('should not create user because of invalid signature', async function() {
    const payload = jwt.verify(correctToken, APP_SECRET) as { userId: number, iat: number, exp: number };
    const invalidSignatureToken = jwt.sign({ ...payload }, 'wrong signature');

    const res = await requestCreateUserMutationWithToken(newUser, invalidSignatureToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.JWT_INVALID_SIGNATURE);

    await expectNewUserToBeUndefined();
  });

  it('should not create user because there is no logged userId on token payload', async function() {
    const payload = jwt.verify(correctToken, APP_SECRET) as { userId: number, iat: number, exp: number };
    const tokenWithoutUserId = jwt.sign({ ...payload, userId: undefined }, APP_SECRET);

    const res = await requestCreateUserMutationWithToken(newUser, tokenWithoutUserId);

    expect(res.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.MALFORMED_TOKEN_PAYLOAD);

    await expectNewUserToBeUndefined();
  });

  it('should not create user because email is not unique', async function() {
    const res = await requestCreateUserMutationWithToken(savedUser, correctToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.VALIDATION_ERRORS);
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.EMAIL_ALREADY_USED }]);
    
    await expectNumberOfUsersToBeOne();
  });

  it('should not create user because password does not have digit', async function() {
    const wrongUser = { ...newUser, password: 'abcdefgh'};
    const res = await requestCreateUserMutationWithToken(wrongUser, correctToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.VALIDATION_ERRORS);
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.PASSWORD_WITHOUT_DIGIT }]);

    await expectNumberOfUsersToBeOne();
  });

  it('should not create user because password does not have letter', async function() {
    const wrongUser = { ...newUser, password: '12345678'};
    const res = await requestCreateUserMutationWithToken(wrongUser, correctToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.VALIDATION_ERRORS);
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.PASSWORD_WITHOUT_LETTER }]);

    await expectNumberOfUsersToBeOne();
  });

  it('should not create user because password does not have minimum size', async function() {
    const wrongUser = { ...newUser, password: 'a1'};
    const res = await requestCreateUserMutationWithToken(wrongUser, correctToken);

    expect(res.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.VALIDATION_ERRORS);
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.PASSWORD_MINIMUM_SIZE }]);

    await expectNumberOfUsersToBeOne();
  });
});