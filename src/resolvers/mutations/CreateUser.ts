import * as jwt from 'jsonwebtoken';
import * as HttpStatusCode from 'http-status-codes';

import { CreateUserInput, AuthPayload } from "../types";
import { APP_SECRET } from '../../utils';
import { User } from '../../entity/User';

export const CreateUser = (_, { user: CreateUserInput }, { request, response }): User => {
  const authorization = request.get('Authorization');
  if (authorization) {
    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = jwt.verify(token, APP_SECRET) as AuthPayload;
      
    } catch (error) {
      response.statusCode = HttpStatusCode.UNAUTHORIZED;
      throw error;
    }
    if (!payload.userId) {
      response.statusCode = HttpStatusCode.BAD_REQUEST;
      throw Error('Malformed token payload');
    }

    return { id: 1, name: 'name', email: 'email', birthDate: new Date(), cpf: '10020030012', password: ''};
  }

  response.statusCode = HttpStatusCode.UNAUTHORIZED;
  throw Error('Missing Authorization Header');
}