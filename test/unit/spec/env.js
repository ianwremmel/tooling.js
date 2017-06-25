'use strict';

const {assert} = require(`chai`);
const transform = require(`../../../src/transform`);
const sinon = require(`sinon`);

describe(`env`, () => {
  it(`aliases process.env in comparisons`, () => {
    process.env.TEST_ENV_VAR_READONLY = 5;
    const spy = sinon.spy();

    const code = transform(`
      if (env.TEST_ENV_VAR_READONLY == 5)  {
        spy()
      }
    `);

    return assert.isFulfilled(eval(code))
      .then(() => assert.calledOnce(spy));
  });

  it(`aliases process.env in assignments`, () => {
    assert.isUndefined(process.env.TEST_ENV_VAR);
    const code = transform(`
      env.TEST_ENV_VAR = 2;
    `);

    return assert.isFulfilled(eval(code))
      .then(() => assert.equal(process.env.TEST_ENV_VAR, 2));
  });
});
