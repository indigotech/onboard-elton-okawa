import { getRepository } from "typeorm";

import { UserEntity } from "src/entity/User.entity";
import { UserPage, PageInfo } from "src/resolvers/types";

const DEFAULT_LIMIT = 5

export const Users = async (_, { limit, offset }): Promise<UserPage> => {
  const usersPerPage = limit || DEFAULT_LIMIT;
  const offsetUsers = offset || 0;
  const userRepository = getRepository(UserEntity);
  const users = await userRepository.find({ order: { name: "ASC" }, take: usersPerPage, skip: offsetUsers });
  const totalCount = await userRepository.count();

  const pageInfo: PageInfo = { 
    hasPreviousPage: offsetUsers > 0 && totalCount > 0, 
    hasNextPage: totalCount - (usersPerPage + offsetUsers) > 0 };
  return { users, totalCount, pageInfo };
};