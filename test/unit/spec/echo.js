const assert = require(`chai`).assert;
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);

describe(`echo`, () => {
  let spy;
  beforeEach(() => {
    spy = sinon.spy(console, `log`);
  });
  afterEach(() => spy.restore());

  it(`gets injected into the global scope`, () => {
    assert.doesNotThrow(() => {
      eval(transform(`echo("abc")`));
    });
  });

  it(`prints its arguments to stdout`, () => {
    eval(transform(`echo(\`1\`)`));
    assert.calledWith(spy, `1`);
  });
});
