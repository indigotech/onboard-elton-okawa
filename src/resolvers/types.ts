import { ObjectType, Field, InputType, Int } from 'type-graphql';

import { User } from 'src/entity/User.entity';

@ObjectType()
export class AuthPayload {

  @Field(type => User)
  user: User;

  @Field()
  token: string;
}

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  password: string;

  @Field()
  email: string;

  @Field()
  birthDate: string;

  @Field()
  cpf: string;
}

@ObjectType()
export class PageInfo {

  @Field()
  hasPreviousPage: boolean;

  @Field()
  hasNextPage: boolean;
}

@ObjectType()
export class UserPage {

  @Field(type => Int)
  totalCount: number;

  @Field(type => [User])
  users: User[];

  @Field(type => PageInfo)
  pageInfo: PageInfo;
}
