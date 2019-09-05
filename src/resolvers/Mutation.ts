import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { User } from '../entity/User';
import { APP_SECRET } from '../utils';

interface AuthPayload {
  user: User;
  token: string;
}

const Login = async (_, { email, password, rememberMe}, { db }): Promise<AuthPayload> => {
  const user: User = await db.manager.findOne(User, { email });
  if (!user) { 
    throw Error('Email not found in database'); 
  }

  const isPasswordCorrect: boolean = await bcryptjs.compare(password, user.password);
  if (!isPasswordCorrect) { 
    throw Error('Invalid credentials, please check your e-mail and password');
  }

  const oneWeek = 604800;
  const oneHour = 3600;
  const expireTimeInSeconds = rememberMe ? oneWeek : oneHour;
  const token = jwt.sign({ userId: user.id }, APP_SECRET, { expiresIn: expireTimeInSeconds });

  return { user, token };
};

export default {
  Login,
}