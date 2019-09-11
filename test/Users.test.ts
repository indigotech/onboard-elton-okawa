import * as jwt from 'jsonwebtoken';
import { getRepository } from "typeorm";
import gql from 'graphql-tag';
import { expect } from 'chai';

import * as ErrorMessages from 'src/ErrorMessages';
import { requestGraphQL, requestGraphQLWithToken } from 'test/requestGraphQL';
import { User } from "src/entity/User.entity";
import { addManyDummyUsersOnDb } from "test/addDummyUserOnDb";
import { APP_SECRET } from 'src/utils';

describe('Users', function() {
  const ONE_MINUTE = 60;
  const NUMBER_OF_USERS = 10;

  let graphQLFormatUsers;
  let correctToken;

  const getUsersQuery = () => {
    return gql`
      query Users($limit: Int, $offset: Int) { 
        Users(limit: $limit, offset: $offset) {
          totalCount
          users {
            id
            email
            cpf
            birthDate
            name
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
          }
        }
      }
    `
  };

  const requestUsersQuery = (variables: { limit?: number, offset?: number }) => {
    const query = getUsersQuery();
    return requestGraphQL(this.ctx.request, { query, variables });
  };

  const requestUsersQueryWithToken = (variables: { limit?: number, offset?: number }, token) => {
    const query = getUsersQuery();
    return requestGraphQLWithToken(this.ctx.request, { query, variables }, token);
  };

  before(function() {
    this.userRepository = getRepository(User);
  });

  beforeEach(async function() {
    await addManyDummyUsersOnDb(NUMBER_OF_USERS);
    let orderedUsers = await this.userRepository.find({ order: { name: "ASC" }});
    graphQLFormatUsers = orderedUsers.map(user => {
      return {
        id: user.id.toString(),
        birthDate: new Date(user.birthDate).getTime().toString(),
        cpf: user.cpf,
        name: user.name,
        email: user.email,
      };
    });
    correctToken = jwt.sign({ userId: graphQLFormatUsers[0].id }, APP_SECRET, { expiresIn: ONE_MINUTE });
  });

  afterEach(async function() {
    await this.userRepository.delete(graphQLFormatUsers);
  });

  it('should return an error because its missing auth token', async function() {
    const res = await requestUsersQuery({ limit: 5, offset: 0 });

    const { errors } = res.body;
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.MISSING_AUTH_HEADER }]);
  });

  it('should return the first 5 users ordered by name', async function() {
    const res = await requestUsersQueryWithToken({ limit: 5, offset: 0 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers.slice(0, 5));
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: false, hasNextPage: true });
  });

  it('should return six users starting from the third', async function() {
    const res = await requestUsersQueryWithToken({ limit: 6, offset: 2 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers.slice(2, 8));
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: true, hasNextPage: true });
  });

  it('should return the last two users skipping eight', async function() {
    const res = await requestUsersQueryWithToken({ limit: 5, offset: 8 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers.slice(8));
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: true, hasNextPage: false }); 
  });

  it('should return zero users because it is skipping all of them', async function() {
    const res = await requestUsersQueryWithToken({ limit: 5, offset: 100 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.empty;
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: true, hasNextPage: false });
  });

  it('should return default five users because limit is zero', async function() {
    const res = await requestUsersQueryWithToken({ limit: 0, offset: 0 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers.slice(0, 5));
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: false, hasNextPage: true });
  });

  it('should return all users because limit is higher than total', async function() {
    const res = await requestUsersQueryWithToken({ limit: 100, offset: 0 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers);
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: false, hasNextPage: false });
  });

  it('should return an error because limit is negative', async function() {
    const res = await requestUsersQueryWithToken({ limit: -1, offset: 0 }, correctToken);
    
    const { errors } = res.body;
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.LIMIT_NEGATIVE }]);
  });

  it('should return an error because offset is negative', async function() {
    const res = await requestUsersQueryWithToken({ limit: 5, offset: -1 }, correctToken);

    const { errors } = res.body;
    expect(errors[0].details).to.be.deep.equals([{ message: ErrorMessages.OFFSET_NEGATIVE }]);
  });
  
  it('should return five users by default because limit is optional', async function() {
    const res = await requestUsersQueryWithToken({ offset: 0 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers.slice(0, 5));
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: false, hasNextPage: true });
  });

  it('should return starting of zero by default because offset is optional', async function() {
    const res = await requestUsersQueryWithToken({ limit: 5 }, correctToken);

    const { totalCount, users, pageInfo } = res.body.data.Users;
    expect(totalCount).to.be.equals(NUMBER_OF_USERS);
    expect(users).to.be.deep.equals(graphQLFormatUsers.slice(0, 5));
    expect(pageInfo).to.be.deep.equals({ hasPreviousPage: false, hasNextPage: true });
  });
});