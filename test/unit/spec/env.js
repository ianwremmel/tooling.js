'use strict';

const assert = require(`chai`).assert;
const transform = require(`../../../src/transform`);

describe(`env`, () => {
  it(`aliases process.env`, () => {
    assert.isUndefined(process.env.TEST_ENV_VAR);
    const code = transform(`
      env.TEST_ENV_VAR = 2;
    `);
    return assert.isFulfilled(eval(code))
      .then(() => assert.equal(process.env.TEST_ENV_VAR, 2));
  });
});
