import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as HttpStatus from 'http-status-codes';

import * as ErrorMessages from 'src/ErrorMessages';
import { APP_SECRET } from 'src/utils';
import { UserEntity } from 'src/entity/User.entity';
import { AuthPayload } from 'src/resolvers/types';

export const Login = async (_, { email, password, rememberMe}, { response, db }): Promise<AuthPayload> => {
  const user: UserEntity = await db.manager.findOne(UserEntity, { email });
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