import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as HttpStatus from 'http-status-codes';

import * as ErrorMessages from '../../ErrorMessages';
import { APP_SECRET } from '../../utils';
import { User } from '../../entity/User';
import { AuthPayload } from '../types';

export const Login = async (_, { email, password, rememberMe}, { response, db }): Promise<AuthPayload> => {
  const user: User = await db.manager.findOne(User, { email });
  if (!user) { 
    response.statusCode = HttpStatus.NOT_FOUND;
    throw Error(ErrorMessages.EMAIL_NOT_FOUND); 
  }

  const isPasswordCorrect: boolean = await bcryptjs.compare(password, user.password);
  if (!isPasswordCorrect) { 
    response.statusCode = HttpStatus.UNAUTHORIZED;
    throw Error(ErrorMessages.INVALID_CREDENTIALS);
  }

  const oneWeek = 604800;
  const oneHour = 3600;
  const expireTimeInSeconds = rememberMe ? oneWeek : oneHour;
  const token = jwt.sign({ userId: user.id }, APP_SECRET, { expiresIn: expireTimeInSeconds });

  return { user, token };
};