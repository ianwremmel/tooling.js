const chai = require(`chai`);
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);

sinon.assert.expose(chai.assert, {prefix: ``});

const assert = chai.assert;

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
