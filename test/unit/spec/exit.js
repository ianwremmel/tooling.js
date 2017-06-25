'use strict';

const {assert} = require(`chai`);
const transform = require(`../../../src/transform`);
const cp = require(`child_process`);

describe(`exit`, () => {
  it(`exits the process with the specified code`, (done) => {
    const code = transform(`
      exit(12)
    `);

    cp.exec(`echo '${code}' | node`, (err) => {
      assert.equal(err.code, 12);
      done();
    });
  });
});
