import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
import * as HttpStatusCode from 'http-status-codes';

import { CreateUserInput, AuthPayload } from "../types";
import { APP_SECRET } from '../../utils';
import { User } from '../../entity/User';
import { DetailedError } from '../../DetailedError';
import { ErrorPack } from '../../ErrorPack';

export const CreateUser = async (_, { user }, { request, response, db }): Promise<User> => {
  const authorization = request.get('Authorization');
  if (authorization) {
    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = jwt.verify(token, APP_SECRET) as AuthPayload;
      
    } catch (error) {
      response.statusCode = HttpStatusCode.UNAUTHORIZED;
      throw error;
    }
    if (!payload.userId) {
      response.statusCode = HttpStatusCode.BAD_REQUEST;
      throw new DetailedError('Malformed token payload');
    }

    let errors: DetailedError[] = verifyPassword(user.password);
    const isEmailUnique = !(await db.manager.findOne(User, { email: user.email }));
    if (!isEmailUnique) {
      errors.push(new DetailedError('Email already used'));
    }
    
    if (errors.length > 0) {
      throw new ErrorPack('Validation errors', errors);
    }

    const salt = bcryptjs.genSaltSync(10);
    return db.manager.save(User, { ...user, password: bcryptjs.hashSync(user.password, salt) });
  }
  
  response.statusCode = HttpStatusCode.UNAUTHORIZED;
  throw new DetailedError('Missing Authorization Header');
}

const verifyPassword = (password: string): DetailedError[] => {
  const errors: DetailedError[] = [];

  const digitMatch = password.match(/\d/);
  const hasDigit = digitMatch && digitMatch.length > 0;
  if (!hasDigit) {
    errors.push(new DetailedError('Password does not have digit'));
  }

  const letterMatch = password.match(/\D/);
  const hasLetter = letterMatch && letterMatch.length > 0;
  if (!hasLetter) {
    errors.push(new DetailedError('Password does not have letter'));
  }

  const hasMinimumSize = password.length >= 7;
  if (!hasMinimumSize) {
    errors.push(new DetailedError('Password does not have minimum size'));
  }
  return errors;
};