import { getRepository } from 'typeorm';
import { Resolver, Arg, Query, ID, Authorized} from 'type-graphql';

import { User } from 'src/entity/User.entity';

@Resolver(User)
export class UserResolver {

  @Authorized()
  @Query(returns => User, { nullable: true })
  User(@Arg("id", returns => ID) id: number): Promise<User> {
    return getRepository(User).findOne(id);
  }
}