import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { expect } from 'chai';
import * as HttpStatus from 'http-status-codes';

import { User } from '../src/entity/User';
import { getRepository } from 'typeorm';

describe('Login', function() {
  const PASSWORD = '1234';
  const ONE_HOUR = 3600;
  const ONE_WEEK = 604800;
  let savedUser;

  const requestLoginMutation = async (email: string, password: string, rememberMe: boolean = false) => {
    const { request } = this.ctx;
    return await request.post('/').send({ 
      query: `mutation { Login(email: \"${email}\", password: \"${password}\", rememberMe: ${rememberMe}) { user { id name email birthDate cpf } token }}` });
  }

  before(function() {
    this.userRepository = getRepository(User);
  });

  beforeEach(async function() {
    const newUser: User = new User();
    newUser.name = 'name';
    newUser.email = 'email@email.com';
    newUser.birthDate = new Date(1286668800000);
    newUser.cpf = '20020020012';
    newUser.password = bcryptjs.hashSync('1234');

    savedUser = await this.userRepository.save(newUser);
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
    const { request } = this.test.ctx;
    const res = await request.post('/').send({ 
      query: `mutation { Login(email: \"${savedUser.email}\", password: \"${PASSWORD}\") { user { id name email birthDate cpf } token }}` });
  
    const { errors } = res.body;
    expect(errors).to.be.undefined;
  });

  it('should return not found error', async function() {
    const res = await requestLoginMutation('wrongEmail@email.com', PASSWORD);
    
    const { errors } = res.body;
    expect(errors[0].message).to.be.equals('Email not found in database');
    expect(res.status).to.be.equals(HttpStatus.NOT_FOUND);
  });

  it('should not authorize if password is wrong', async function() {
    const res = await requestLoginMutation(savedUser.email, 'wrongPassword');

    const { errors } = res.body;
    expect(errors[0].message).to.be.equals('Invalid credentials, please check your e-mail and password');
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


