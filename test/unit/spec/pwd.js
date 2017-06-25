'use strict';

const {assert} = require(`chai`);
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);
const cp = require(`child_process`);

describe(`pwd`, () => {
  let current, spy;
  beforeEach(() => {
    spy = sinon.spy(console, `log`);
    current = process.cwd();
  });
  afterEach(() => spy.restore());
  afterEach(() => process.chdir(current));

  it(`prints the current directory`, (done) => {
    const code = transform(`
      pwd()
    `);

    cp.exec(`echo '${code}' | node`, (err, out) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(out, `${process.cwd()}\n`);
      done();
    });
  });

  it(`returns the current directory`, () => {
    // eslint-disable-next-line no-unused-vars
    let dir;
    const code = transform(`
      dir = pwd();
    `);

    return assert.isFulfilled(eval(code))
      .then(() => {
        assert.equal(dir, process.cwd());
      });
  });

});
