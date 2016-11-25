const assert = require(`chai`).assert;
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);

describe(`echo`, () => {
  it(`gets injected into the global scope`, () => {
    assert.doesNotThrow(() => {
      eval(transform(`echo("abc")`));
    });
  });

  it(`prints its arguments to stdout`, () => {
    const spy = sinon.spy(console, `log`);
    eval(transform(`echo(\`1\`)`));
    assert.calledWith(spy, `1`);
  });
});
