import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { expect } from 'chai';
import * as HttpStatus from 'http-status-codes';

import { User } from '../src/entity/User';

export default function loginTest() {
  describe('Login', function() {
    const EMAIL = 'email@email.com'
    const PASSWORD = '1234';
    const ONE_DAY = 86400;

    const requestLoginMutation = async (email: string, password: string, rememberMe: boolean = false) => {
      const { request } = this.ctx;

      return await request.post('/').send({ 
        query: `mutation { Login(email: \"${email}\", password: \"${password}\", rememberMe: ${rememberMe}) { user { id name email birthDate cpf } token }}` });
    }

    beforeEach(async function() {
      const { connection } = this.test.ctx;

      const user: User = new User();
      user.name = 'name';
      user.email = 'email@email.com';
      user.birthDate = new Date(1286668800000);
      user.cpf = '20020020012';
      user.password = bcryptjs.hashSync('1234');

      await connection.manager.save(user);
    });

    afterEach(async function() {
      const { connection } = this.test.ctx;
      await connection.manager.delete(User, { email: 'email@email.com' });
    });

    it('should login successfully', async function() {
      const res = await requestLoginMutation(EMAIL, PASSWORD);

      const { name, email, birthDate, cpf } = res.body.data.Login.user;
      expect(name).to.be.equals('name');
      expect(email).to.be.equals('email@email.com');
      expect(birthDate).to.be.equal('1286668800000');
      expect(cpf).to.be.equals('20020020012');
    });

    it('should return all fields', async function() {
      const res = await requestLoginMutation(EMAIL, PASSWORD);

      const { user, token } = res.body.data.Login;
      expect(user.id).not.false;
      expect(user.name).not.false;
      expect(user.email).not.false;
      expect(user.birthDate).not.false;
      expect(user.cpf).not.false;
      expect(token).not.false;
    });
    
    it('should rememberBe be optional', async function() {
      const { request } = this.test.ctx;
      const res = await request.post('/').send({ 
        query: `mutation { Login(email: \"${EMAIL}\", password: \"${PASSWORD}\") { user { id name email birthDate cpf } token }}` });
    
      const { errors } = res.body;
      expect(errors).to.be.undefined;
    });

    it('should not found email', async function() {
      const res = await requestLoginMutation('wrongEmail@email.com', PASSWORD);
      
      const { errors } = res.body;
      expect(errors[0].message).to.be.equals('Email not found in database');
      expect(res.status).to.be.equals(HttpStatus.NOT_FOUND);
    });

    it('should not authorize', async function() {
      const res = await requestLoginMutation(EMAIL, 'wrongPassword');

      const { errors } = res.body;
      expect(errors[0].message).to.be.equals('Invalid credentials, please check your e-mail and password');
      expect(res.status).to.be.equals(HttpStatus.UNAUTHORIZED);
    });

    it('should return token with short lifespan', async function() {
      const res = await requestLoginMutation(EMAIL, PASSWORD, false);
      const { token } = res.body.data.Login;
      const payload = jwt.decode(token) as { [key: string]: number};

      expect(payload.exp - payload.iat).to.be.lessThan(ONE_DAY);
    });

    it('should return token with long lifespan', async function() {
      const res = await requestLoginMutation(EMAIL, PASSWORD, true);
      const { token } = res.body.data.Login;
      const payload = jwt.decode(token) as { [key: string]: number};

      expect(payload.exp - payload.iat).to.be.greaterThan(ONE_DAY);
    });
  });
}

