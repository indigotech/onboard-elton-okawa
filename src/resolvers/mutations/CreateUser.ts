import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
import * as HttpStatusCode from 'http-status-codes';
import { getRepository } from 'typeorm';
import { Resolver, Mutation, Ctx, Arg, Authorized } from 'type-graphql';

import * as ErrorMessages from 'src/ErrorMessages';
import { User } from 'src/entity/User.entity';
import { DetailedError } from 'src/DetailedError';
import { ErrorPack } from 'src/ErrorPack';
import { CreateUserInput } from 'src/resolvers/types';

@Resolver()
export class CreateUserResolver {
  
  @Authorized()
  @Mutation(returns => User)
  async CreateUser(
    @Ctx() ctx: { response },
    @Arg("user") user: CreateUserInput) {
    
    const { response } = ctx;
    let errors: DetailedError[] = verifyPassword(user.password);
    const isEmailUnique = !(await getRepository(User).findOne({ email: user.email }));
    if (!isEmailUnique) {
      errors.push(new DetailedError('Email already used'));
    }
    
    if (errors.length > 0) {
      response.statusCode = HttpStatusCode.BAD_REQUEST;
      throw new ErrorPack('Validation errors', errors);
    }

    const salt = bcryptjs.genSaltSync(10);
    return getRepository(User).save({ ...user, password: bcryptjs.hashSync(user.password, salt) });
  }
}

const verifyPassword = (password: string): DetailedError[] => {
  const errors: DetailedError[] = [];

  const digitMatch = password.match(/\d/);
  const hasDigit = digitMatch && digitMatch.length > 0;
  if (!hasDigit) {
    errors.push(new DetailedError(ErrorMessages.PASSWORD_WITHOUT_DIGIT));
  }

  const letterMatch = password.match(/\D/);
  const hasLetter = letterMatch && letterMatch.length > 0;
  if (!hasLetter) {
    errors.push(new DetailedError(ErrorMessages.PASSWORD_WITHOUT_LETTER));
  }

  const hasMinimumSize = password.length >= 7;
  if (!hasMinimumSize) {
    errors.push(new DetailedError(ErrorMessages.PASSWORD_MINIMUM_SIZE));
  }
  return errors;
};