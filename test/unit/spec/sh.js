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
    const code = transform(`sh("echo 1")`);
    const out = cp.execSync(`echo '${code}' | node`);
    assert.equal(out.toString(), `1\n`);
  });

  it(`throws on non-zero exit codes`, () => assert.isRejected(eval(transform(`sh('exit 47')`)))
    .then((err) => assert.equal(err.code, 47)));

  it(`returns stdout`);
  describe(`when "return" is specified`, () => {
    it(`does not throw`);
    it(`provids access to stderr and stdout`);
  });
  it(`behaves synchronously by default`);
  it(`bahaves asynchonously when the "await" keyword specified`);
});
