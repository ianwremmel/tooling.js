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
    const code = transform(`
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
    spy.reset();
    return assert.isFulfilled(eval(code))
      .then(() => {
        assert.equal(spy.args[0][0], 1);
        assert.equal(spy.args[1][0], 3);
        assert.equal(spy.args[2][0], 2);
      });
  });

  it(`blocks until its children complete`, () => {
    const code = transform(`
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

    spy.reset();
    return assert.isFulfilled(eval(code))
      .then(() => {
        assert.equal(spy.args[0][0], 1);
        assert.equal(spy.args[1][0], 3);
        assert.equal(spy.args[2][0], 2);
        assert.equal(spy.args[3][0], 4);
        assert.equal(spy.args[4][0], 6);
        assert.equal(spy.args[5][0], 5);
      });
  });

  it(`executes multiple tasks in parallel (with concurrency limit)`, () => {
    // small bug: if we `return parallel` instead of `const result = parallel`,
    // the log statements don't fire in the correct order. I don't see this is a
    // major usecase, but it's worth keeping in mind in event of weird failures
    // down the line.
    const code = transform(`
      const result = parallel({concurrency: 3},
        new Promise((resolve) => {
          setTimeout(() => {
            console.log(1);
            resolve(1);
          }, 500)
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            console.log(2);
            resolve(2);
          }, 500)
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            console.log(3);
            resolve(3);
          }, 500)
        }),
        console.log(4),
        console.log(5),
        console.log(6)
      );

      return result;
    `);

    spy.reset();
    return assert.isFulfilled(eval(code))
      .then((result) => {
        assert.equal(spy.args[0][0], 1);
        assert.equal(spy.args[1][0], 2);
        assert.equal(spy.args[2][0], 3);
        assert.equal(spy.args[3][0], 4);
        assert.equal(spy.args[4][0], 5);
        assert.equal(spy.args[5][0], 6);

        const [a, b, c, d, e, f] = result;
        assert.equal(a, 1);
        assert.equal(b, 2);
        assert.equal(c, 3);
        assert.isUndefined(d);
        assert.isUndefined(e);
        assert.isUndefined(f);
      });
  });
});
