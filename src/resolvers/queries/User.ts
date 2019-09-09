import { UserEntity } from '../../entity/User.entity';
import { getRepository } from 'typeorm';
import { verifyAuthToken } from '../../utils';

export const User = (_, { id }, { request, response }): Promise<UserEntity> => {
  const authorization = request.get('Authorization');
  verifyAuthToken(authorization, response);

  return getRepository(UserEntity).findOne({ id });
};