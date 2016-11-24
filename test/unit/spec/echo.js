const assert = require(`chai`).assert;
const transform = require(`../../../src/transform`);

describe(`echo`, () => {
  it(`gets injected into the global scope`, () => {
    assert.equal(eval(transform(`echo(\`1\`)`)), 1);
  });

  it(`prints its arguments to stdout`);
});
