import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
import * as HttpStatusCode from 'http-status-codes';

import { CreateUserInput, AuthPayload } from "../types";
import { APP_SECRET } from '../../utils';
import { User } from '../../entity/User';

interface PasswordVerification {
  name: string;
  valid: boolean;
  errorMessage: string;
}

export const CreateUser = async (_, { user }, { request, response, db }): Promise<User> => {
  const authorization = request.get('Authorization');
  if (!authorization) {
    response.statusCode = HttpStatusCode.UNAUTHORIZED;
    throw Error('Missing Authorization Header');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  
  try {
    payload = jwt.verify(token, APP_SECRET) as AuthPayload;
  } catch (error) {
    response.statusCode = HttpStatusCode.UNAUTHORIZED;
    throw error;
  }

  let errorMessage = '';
  const isEmailUnique = !(await db.manager.findOne(User, { email: user.email }));
  if (!isEmailUnique) {
    errorMessage += 'Email already used';
  }
  
  const verificationResult: PasswordVerification[] = verifyPassword(user.password);
  const isValidPassword: boolean = verificationResult
    .map((passwordVerification: PasswordVerification) => passwordVerification.valid)
    .reduce((previousValue: boolean, currentValue: boolean) => previousValue && currentValue);

  if (!isValidPassword) {
    verificationResult.forEach((passwordVerification: PasswordVerification) => {
      if (!passwordVerification.valid) {
        errorMessage += `\n${passwordVerification.errorMessage}`;
      }
    });
  }

  if (errorMessage.length > 0) {
    throw Error(errorMessage);
  }

  const salt = bcryptjs.genSaltSync(10);
  return await db.manager.save(User, { ...user, password: bcryptjs.hashSync(user.password, salt) });
}

const verifyPassword = (password: string): PasswordVerification[] => {
  const digitMatch = password.match(/\d/);
  const hasDigit = digitMatch && digitMatch.length > 0;

  const letterMatch = password.match(/\D/);
  const hasLetter = letterMatch && letterMatch.length > 0;

  const hasMinimumSize = password.length >= 7;
  return [
    { name: 'hasDigit', valid: hasDigit, errorMessage: 'Password does not have digit' }, 
    { name: 'hasLetter', valid: hasLetter, errorMessage: 'Password does not have letter'}, 
    { name: 'hasMinimumSize', valid: hasMinimumSize, errorMessage: 'Password does not have minimum size'}
  ];
}