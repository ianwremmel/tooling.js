'use strict';

const assert = require(`chai`).assert;
const cp = require(`child_process`);
const path = require(`path`);

describe(`bin`, () => {
  const toolingPath = path.join(__dirname, `../../../bin/tooling`);

  it(`accepts a script file as its first parameter`, function() {
    // between the babel-register compile time and the delay in the fixture, two
    // seconds doesn't quite cut it on circle ci
    this.timeout(5000);

    const stdout = cp.execSync(`${toolingPath} ./test/integration/fixtures/example.js`, {
      cwd: path.resolve(__dirname, `../../..`)
    }).toString();

    assert.equal(stdout, `1\n2\n3\n4\n`);
  });

  it(`accepts a script via pipe`, () => {
    const code = `sh("echo 1")`;

    const out = cp.execSync(`echo '${code}' | ${toolingPath}`);
    assert.equal(out.toString(), `1\n`);
  });

  it(`exits with non-zero code in event of an error`, (done) => {
    const code = `throw new Error("something went wrong")`;

    cp.exec(`set -e; set -o pipefail; echo '${code}' | ${toolingPath}`, {
      shell: `/bin/bash`
    }, (err) => {
      assert.equal(err.code, 64);
      done();
    });
  });

  it(`prints shell errors to stderr`, (done) => {
    const code = `sh(">&2 echo \\"error\\"")`;

    cp.exec(`echo '${code}' | ${toolingPath}`, {
      shell: `/bin/bash`
    }, (error, stdout, stderr) => {
      assert.notMatch(stdout, /error/);
      assert.match(stderr, /error/);
      done();
    });
  });

  it(`prints all output to error in event of failure`, (done) => {
    const code = `sh("npm not-a-command")`;

    cp.exec(`echo '${code}' | ${toolingPath}`, {
      shell: `/bin/bash`
    }, (error, stdout, stderr) => {
      assert.match(stdout, /Usage: npm <command>/);
      assert.match(stderr, /Usage: npm <command>/);
      done();
    });
  });

});
