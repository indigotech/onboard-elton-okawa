import { UserEntity } from 'src/entity/User.entity';
import { getRepository } from 'typeorm';

export const User = (_, { id }, { request, response }): Promise<UserEntity> => {
  return getRepository(UserEntity).findOne(id);
};