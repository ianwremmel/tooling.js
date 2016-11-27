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

    return assert.isFulfilled(eval(transform(code)))
      .then(() => {
        assert.equal(spy.args[0][0], 1);
        assert.equal(spy.args[1][0], 3);
        assert.equal(spy.args[2][0], 2);
      });

  });

  it(`executes multiple tasks in parallel (with concurrency limit)`);
});
