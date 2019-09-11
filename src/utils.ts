import * as jwt from 'jsonwebtoken';
import * as HttpStatusCode from 'http-status-codes';

import { AuthPayload } from './resolvers/types';
import { DetailedError } from './DetailedError';
import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver } from 'graphql';

export const APP_SECRET = '$UP3R S3CR3T';

export const verifyAuthToken = (authorization: string | null, response: { statusCode: number }): void => {
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
      throw new DetailedError('Malformed token payload');
    }
  } else {
    response.statusCode = HttpStatusCode.UNAUTHORIZED;
    throw new DetailedError('Missing Authorization Header');
  }
};

export const getTokenPayload = (authorization: string): AuthPayload => {
  const token = authorization.replace('Bearer ', '');
  return jwt.verify(token, APP_SECRET) as AuthPayload;
}

export class IsAuthDirective extends SchemaDirectiveVisitor {

  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(parent, args, context, info) {
      const { request, response } = context;
      const authorization = request.get('Authorization');
      verifyAuthToken(authorization, response);

      const result = await resolve.apply(this, [parent, args, context, info]);
      return result;
    };
  }
}