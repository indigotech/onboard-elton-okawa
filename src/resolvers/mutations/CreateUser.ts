import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
import * as HttpStatusCode from 'http-status-codes';

import * as ErrorMessages from 'src/ErrorMessages';
import { verifyAuthToken } from 'src/utils';
import { UserEntity } from 'src/entity/User.entity';
import { DetailedError } from 'src/DetailedError';
import { ErrorPack } from 'src/ErrorPack';

export const CreateUser = async (_, { user }, { request, response, db }): Promise<UserEntity> => {
  let errors: DetailedError[] = verifyPassword(user.password);
  const isEmailUnique = !(await db.manager.findOne(UserEntity, { email: user.email }));
  if (!isEmailUnique) {
    errors.push(new DetailedError('Email already used'));
  }
  
  if (errors.length > 0) {
    response.statusCode = HttpStatusCode.BAD_REQUEST;
    throw new ErrorPack('Validation errors', errors);
  }

  const salt = bcryptjs.genSaltSync(10);
  return db.manager.save(UserEntity, { ...user, password: bcryptjs.hashSync(user.password, salt) });
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