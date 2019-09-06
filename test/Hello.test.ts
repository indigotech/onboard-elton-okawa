import { expect } from "chai";

describe('Hello', function() {
  it('should return hello world', async function() {
    const res = await this.test.ctx.request.post('/').send({ query: '{ Hello }'});
    expect(res.body.data.Hello).to.be.eq('Hello, world!');
  });
});