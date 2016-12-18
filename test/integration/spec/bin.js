'use strict';

const assert = require(`assert`);
const cp = require(`child_process`);
const path = require(`path`);

describe(`bin`, () => {
  it(`accepts a script file as its first parameter`, function() {
    // between the babel-register compile time and the delay in the fixture, two
    // seconds doesn't quite cut it on circle ci
    this.timeout(5000);

    const stdout = cp.execSync(`bin/tooling ./test/integration/fixtures/example.js`, {
      cwd: path.resolve(__dirname, `../../..`)
    }).toString();

    assert.equal(stdout, `1\n2\n3\n4\n`);
  });
});
