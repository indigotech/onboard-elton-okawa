import * as jwt from 'jsonwebtoken';
import { expect } from 'chai';

import formatError from '../src/formatError';
import { DetailedError } from '../src/DetailedError';
import { ErrorPack } from '../src/ErrorPack';
describe('formatError', function() {
  describe('should always return the same response format for:', function() {
    const ERROR_MESSAGE = 'Error message';
    const DETAILED_ERROR_MESSAGE = 'Detailed error message';

    it('Error', function() {
      const formattedError = getFormattedError(new Error(ERROR_MESSAGE));
      expect(formattedError).to.have.deep.property('details', [{ message: ERROR_MESSAGE}]);
    });

    it('JsonWebTokenError', function() {
      try {
        jwt.verify('wrongToken', 'wrongKey');
      } catch(error) {
        const formattedError = getFormattedError(error);
        expect(formattedError).to.have.deep.property('details', [{ message: 'jwt malformed'}]);
      }
    });

    it('ErrorPack without details', function() {
      const errors = [ new DetailedError(ERROR_MESSAGE) ];
      const formattedError = getFormattedError(new ErrorPack(ERROR_MESSAGE, errors));
      expect(formattedError).to.have.deep.property('details', [{ message: ERROR_MESSAGE, detailedMessage: undefined }]);
    });

    it('ErrorPack with details', function() {
      const errors = [ new DetailedError(ERROR_MESSAGE, DETAILED_ERROR_MESSAGE)];
      const formattedError = getFormattedError(new ErrorPack(ERROR_MESSAGE, errors));
      expect(formattedError).to.have.deep.property('details', 
        [{ message: ERROR_MESSAGE, detailedMessage: DETAILED_ERROR_MESSAGE}]);    
    });

    it('GraphQLErrors', async function() {
      const { request } = this.test.ctx;
      const res = await request.post('/').send({ query: 'wrongQuery'});
      expect(res.body.errors[0]).to.have.deep.property('details', [{ message: 'Syntax Error: Unexpected Name \"wrongQuery\"'}]);
    });
  });
});

const getFormattedError = (error: Error) => {
  return formatError({ originalError: error, message: 'error'});
}