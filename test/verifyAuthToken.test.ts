import * as HttpStatusCode from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { expect } from 'chai';

import * as ErrorMessages from 'src/ErrorMessages';
import { verifyAuthToken, APP_SECRET } from "src/utils";

describe('verifyAuthToken', function() {

  let response;

  beforeEach(function() {
    response = { statusCode: null };
  });

  it('should raise an error because there is not auth header', function() {
    expect(() => verifyAuthToken(null, response)).to.throw(ErrorMessages.MISSING_AUTH_HEADER);
    expect(response.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
  });

  it('should raise an error because token is expired', function() {
    const token = jwt.sign({ userId: 1, iat: 100, exp: 200 }, APP_SECRET);
    expect(() => verifyAuthToken(token, response)).to.throw(ErrorMessages.JWT_EXPIRED);
    expect(response.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
  });

  it('should raise an error because of invalid signature on token', function() {
    const token = jwt.sign({ userId: 1 }, 'wrongSecret');
    expect(() => verifyAuthToken(token, response)).to.throw(ErrorMessages.JWT_INVALID_SIGNATURE);
    expect(response.statusCode).to.be.equals(HttpStatusCode.UNAUTHORIZED);
  });

  it('should raise an error because there is not userId on token payload', function() {
    const token = jwt.sign({}, APP_SECRET);
    expect(() => verifyAuthToken(token, response)).to.throw(ErrorMessages.MALFORMED_TOKEN_PAYLOAD);
    expect(response.statusCode).to.be.equals(HttpStatusCode.BAD_REQUEST);
  });
});