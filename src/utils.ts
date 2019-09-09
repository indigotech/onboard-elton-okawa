import * as jwt from 'jsonwebtoken';
import * as HttpStatusCode from 'http-status-codes';

import { AuthPayload } from './resolvers/types';
import { DetailedError } from './DetailedError';

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