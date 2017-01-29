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

  it(`accepts a script via pipe`, () => {
    const code = `sh("echo 1")`;

    const toolingPath = path.join(__dirname, `../../../bin/tooling`);
    const out = cp.execSync(`echo '${code}' | ${toolingPath}`);
    assert.equal(out.toString(), `1\n`);
  });

  it(`exits with non-zero code in event of an error`, (done) => {
    const code = `throw new Error("something went wrong")`;

    const toolingPath = path.join(__dirname, `../../../bin/tooling`);
    cp.exec(`set -e; set -o pipefail; echo '${code}' | ${toolingPath}`, {
      shell: `/bin/bash`
    }, (err) => {
      assert.equal(err.code, 64);
      done();
    });
  });
});
