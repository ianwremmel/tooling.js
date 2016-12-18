'use strict';

const assert = require(`assert`);
const cp = require(`child_process`);
const path = require(`path`);

describe(`esnext`, () => {
  it(`handles multiple files using esnext module syntax`, function() {
    // between the babel-register compile time and the delay in the fixture, two
    // seconds doesn't quite cut it on circle ci
    this.timeout(5000);

    const stdout = cp.execSync(`bin/tooling ./test/integration/fixtures/import.js`, {
      cwd: path.resolve(__dirname, `../../..`)
    }).toString();

    assert.equal(stdout, `10\n`);
  });
});
