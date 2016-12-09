"use strict";

const assert = require(`chai`).assert;
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);

describe(`cd`, () => {
  let current, spy;
  beforeEach(() => {
    spy = sinon.spy(console, `log`);
    current = process.cwd();
  });
  afterEach(() => spy.restore());
  afterEach(() => process.chdir(current));

  it(`changes the current directory`, () => {
    // eslint-disable-next-line no-unused-vars
    let end, start;
    const code = transform(`
      start = process.cwd();
      cd("/tmp")
      end = process.cwd();
    `);

    return assert.isFulfilled(eval(code))
      .then(() => {
        assert.notEqual(end, start);
        // use match because osx aliases /private/tmp as /tmp
        assert.match(end, /\/tmp/);
      });
  });

});
