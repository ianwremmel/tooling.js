"use strict";

const assert = require(`chai`).assert;
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);

describe(`parallel`, () => {
  let spy;
  beforeEach(() => {
    spy = sinon.spy(console, `log`);
  });
  afterEach(() => spy.restore());

  it(`executes multiple tasks in parallel`, () => {
    const code = (`
      parallel(
        console.log(1),
        new Promise((resolve) => {
          process.nextTick(() => {
            console.log(2);
            resolve();
          })
        }),
        console.log(3)
      );
    `);

    return assert.isFulfilled(eval(transform(code)))
      .then(() => {
        assert.equal(spy.args[0][0], 1);
        assert.equal(spy.args[1][0], 3);
        assert.equal(spy.args[2][0], 2);
      });
  });

  it(`blocks until its children complete`, () => {
    const code = (`
      parallel(
        console.log(1),
        new Promise((resolve) => {
          process.nextTick(() => {
            console.log(2);
            resolve();
          })
        }),
        console.log(3)
      );

      parallel(
        console.log(4),
        new Promise((resolve) => {
          process.nextTick(() => {
            console.log(5);
            resolve();
          })
        }),
        console.log(6)
      );

    `);

    return assert.isFulfilled(eval(transform(code)))
      .then(() => {
        assert.equal(spy.args[0][0], 1);
        assert.equal(spy.args[1][0], 3);
        assert.equal(spy.args[2][0], 2);
        assert.equal(spy.args[3][0], 4);
        assert.equal(spy.args[4][0], 6);
        assert.equal(spy.args[5][0], 5);
      });
  });

  it(`executes multiple tasks in parallel (with concurrency limit)`);
});
