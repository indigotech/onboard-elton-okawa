import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
import * as HttpStatusCode from 'http-status-codes';

import * as ErrorMessages from '../../ErrorMessages';
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
      throw new DetailedError(ErrorMessages.MALFORMED_TOKEN_PAYLOAD);
    }

    let errors: DetailedError[] = verifyPassword(user.password);
    const isEmailUnique = !(await db.manager.findOne(User, { email: user.email }));
    if (!isEmailUnique) {
      errors.push(new DetailedError(ErrorMessages.EMAIL_ALREADY_USED));
    }
    
    if (errors.length > 0) {
      response.statusCode = HttpStatusCode.BAD_REQUEST;
      throw new ErrorPack(ErrorMessages.VALIDATION_ERRORS, errors);
    }

    const salt = bcryptjs.genSaltSync(10);
    return db.manager.save(User, { ...user, password: bcryptjs.hashSync(user.password, salt) });
  }
  
  response.statusCode = HttpStatusCode.UNAUTHORIZED;
  throw new DetailedError(ErrorMessages.MISSING_AUTH_HEADER);
}

const verifyPassword = (password: string): DetailedError[] => {
  const errors: DetailedError[] = [];

  const digitMatch = password.match(/\d/);
  const hasDigit = digitMatch && digitMatch.length > 0;
  if (!hasDigit) {
    errors.push(new DetailedError(ErrorMessages.PASSWORD_WITHOUT_DIGIT));
  }

  const letterMatch = password.match(/\D/);
  const hasLetter = letterMatch && letterMatch.length > 0;
  if (!hasLetter) {
    errors.push(new DetailedError(ErrorMessages.PASSWORD_WITHOUT_LETTER));
  }

  const hasMinimumSize = password.length >= 7;
  if (!hasMinimumSize) {
    errors.push(new DetailedError(ErrorMessages.PASSWORD_MINIMUM_SIZE));
  }
  return errors;
};