const chai = require(`chai`);
const sinon = require(`sinon`);
const transform = require(`../../../src/transform`);
const cp = require(`child_process`);
const chaiAsPromised = require(`chai-as-promised`);

chai.use(chaiAsPromised);
sinon.assert.expose(chai.assert, {prefix: ``});

const assert = chai.assert;

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
  it(`behaves synchronously by default`);
  it(`bahaves asynchonously when the "await" keyword specified`);
});
