import * as jwt from 'jsonwebtoken';
import { expect } from 'chai';
import * as HttpStatus from 'http-status-codes';
import { getRepository } from 'typeorm';
import gql from 'graphql-tag';

import { requestGraphQL } from 'test/requestGraphQL';
import * as ErrorMessages from 'src/ErrorMessages';
import { UserEntity } from 'src/entity/User.entity';
import { addDummyUserOnDb } from 'test/addDummyUserOnDb';

describe('Login', function() {
  const PASSWORD = '1234';
  const ONE_HOUR = 3600;
  const ONE_WEEK = 604800;
  let savedUser;

  const requestLoginMutation = (email: string, password: string, rememberMe: boolean = false) => {
    const query = gql`
      mutation { 
        Login(
          email: "${email}", 
          password: "${password}", 
          rememberMe: ${rememberMe}) { 
    
            user { 
              id 
              name 
              email 
              birthDate 
              cpf } 
            token 
        }
    }`;
    return requestGraphQL(this.ctx.request, query);
  };

  const requestLoginMutationWithoutRememberMe = (email: string, password: string) => {
    const query = gql`
    mutation { 
      Login(
        email: "${email}", 
        password: "${password}") { 
  
          user { 
            id 
            name 
            email 
            birthDate 
            cpf } 
          token 
      }
    }`;
    return requestGraphQL(this.ctx.request, query);
  };

  before(function() {
    this.userRepository = getRepository(UserEntity);
  });

  beforeEach(async function() {
    savedUser = await addDummyUserOnDb();
  });

  afterEach(async function() {
    await this.userRepository.delete({ email: savedUser.email });
  });

  it('should login successfully', async function() {
    const res = await requestLoginMutation(savedUser.email, PASSWORD);

    const { name, email, birthDate, cpf } = res.body.data.Login.user;
    expect(name).to.be.equals(savedUser.name);
    expect(email).to.be.equals(savedUser.email);
    expect(Number.parseInt(birthDate)).to.be.equal(savedUser.birthDate.getTime());
    expect(cpf).to.be.equals(savedUser.cpf);
  });

  it('should return all fields', async function() {
    const res = await requestLoginMutation(savedUser.email, PASSWORD);
    
    const { user, token } = res.body.data.Login;
    expect(user.id).is.not.empty;
    expect(user.name).is.not.empty;
    expect(user.email).is.not.empty;
    expect(user.birthDate).is.not.empty;
    expect(user.cpf).is.not.empty;
    expect(token).is.not.empty;
  });
  
  it('should rememberBe be optional', async function() {
    const res = await requestLoginMutationWithoutRememberMe(savedUser.email, PASSWORD);
    const { errors } = res.body;
    expect(errors).to.be.undefined;
  });

  it('should return not found error', async function() {
    const res = await requestLoginMutation('wrongEmail@email.com', PASSWORD);
    
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.EMAIL_NOT_FOUND);
    expect(res.status).to.be.equals(HttpStatus.NOT_FOUND);
  });

  it('should not authorize if password is wrong', async function() {
    const res = await requestLoginMutation(savedUser.email, 'wrongPassword');

    const { errors } = res.body;
    expect(errors[0].message).to.be.equals(ErrorMessages.INVALID_CREDENTIALS);
    expect(res.status).to.be.equals(HttpStatus.UNAUTHORIZED);
  });

  it('should return token with short lifespan', async function() {
    const res = await requestLoginMutation(savedUser.email, PASSWORD, false);
    const { token } = res.body.data.Login;
    const payload = jwt.decode(token) as { [key: string]: number};

    expect(payload.exp - payload.iat).to.be.equals(ONE_HOUR);
  });

  it('should return token with long lifespan', async function() {
    const res = await requestLoginMutation(savedUser.email, PASSWORD, true);
    const { token } = res.body.data.Login;
    const payload = jwt.decode(token) as { [key: string]: number};

    expect(payload.exp - payload.iat).to.be.equals(ONE_WEEK);
  });
});


