const assert = require(`chai`).assert;
const transform = require(`../../../src/transform`);
const cp = require(`child_process`);

describe(`sh`, () => {
  it(`executes shell commands`, () => {
    const code = transform(`
      sh("echo 1")
    `);
    // pipe to node rather than eval so we can get all of stdout without spies
    const out = cp.execSync(`echo '${code}' | node`);
    assert.equal(out.toString(), `1\n`);
  });

  it(`throws on non-zero exit codes`, () => assert.isRejected(eval(transform(`
    sh('exit 47')
  `)))
    .then((err) => assert.equal(err.code, 47)));

  it(`returns stdout`, () => {
    const code = transform(`
      let out = sh("echo 1");
      require("assert")(out === "1\\n");
    `);

    return assert.isFulfilled(eval(code));
  });

  describe(`when "return" is specified`, () => {
    it(`does not throw`, () => {
      const code = transform(`
        let res = sh("exit 1", {complex: true});
      `);

      return assert.isFulfilled(eval(code));
    });

    it(`provides access to stderr and stdout`, () => {
      const code = transform(`
        let res = sh("exit 1", {complex: true});
        require("assert").equal(res.code, 1);
        require("assert")('stdout' in res);
        require("assert")('stderr' in res);
      `);

      return assert.isFulfilled(eval(code));
    });
  });

  it(`behaves synchronously by default`, () => {
    const code = transform(`
      sh("echo 1")
      sh("sleep 1; echo 2")
      sh("echo 3")
    `);

    // pipe to node rather than eval so we can get all of stdout without spies
    const out = cp.execSync(`echo '${code}' | node`);
    assert.equal(out.toString(), `1\n2\n3\n`);
  });

  it(`behaves asynchonously when combined with parallel`, () => {
    const code = transform(`
      parallel(
        sh("echo 1"),
        sh("sleep 1; echo 2"),
        sh("echo 3")
      )
    `);

    // pipe to node rather than eval so we can get all of stdout without spies
    const out = cp.execSync(`echo '${code}' | node`);
    assert.equal(out.toString(), `1\n3\n2\n`);
  });
});
