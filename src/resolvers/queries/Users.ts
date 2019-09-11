import { getRepository } from "typeorm";
import { Resolver, Query, Arg, Int, Authorized } from "type-graphql";

import { User } from "src/entity/User.entity";
import { UserPage, PageInfo } from "src/resolvers/types";

const DEFAULT_LIMIT = 5

@Resolver()
export class UsersResolver {

  @Authorized()
  @Query(returns => UserPage)
  async Users(
    @Arg("limit", type => Int, { nullable: true }) limit: number,
    @Arg("offset", type => Int, { nullable: true }) offset: number) {

    const usersPerPage = limit || DEFAULT_LIMIT;
    const offsetUsers = offset || 0;
    const userRepository = getRepository(User);
    const users = await userRepository.find({ order: { name: "ASC" }, take: usersPerPage, skip: offsetUsers });
    const totalCount = await userRepository.count();
  
    const pageInfo: PageInfo = { 
      hasPreviousPage: offsetUsers > 0 && totalCount > 0, 
      hasNextPage: totalCount - (usersPerPage + offsetUsers) > 0 };
    return { users, totalCount, pageInfo };
  }
}