import { getRepository } from "typeorm";

import { UserEntity } from "src/entity/User.entity";

const DEFAULT_LIMIT = 5

export const Users = (_, { limit }): Promise<UserEntity[]> => {
  return getRepository(UserEntity).find({ order: { name: "ASC" }, take: limit || DEFAULT_LIMIT });
};