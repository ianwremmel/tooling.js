'use strict';

const {assert} = require(`chai`);
const transform = require(`../../../src/transform`);
const os = require(`os`);
const fs = require(`fs`);
const cp = require(`child_process`);

describe(`tee`, () => {
  it(`tees all output to a file`, (done) => {
    const outfile = `${os.tmpdir()}/all-output.log`;
    const code = transform(`
      const t = tee({file: "${outfile}", stderr: true, stdout: true});
      echo(1);
      echo(2);
      console.error(3)
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout, stderr) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, `1\n2\n`);
      assert.equal(stderr, `3\n`);
      assert.equal(fs.readFileSync(outfile).toString(), `1\n2\n3\n`);
      done();
    });
  });

  it(`tees output to a writestream`, (done) => {
    const outfile = `${os.tmpdir()}/stream-output.log`;
    const code = transform(`
      const fs = require("fs");
      const stream = fs.createWriteStream("${outfile}")
      const t = tee({stream: stream, stderr: true, stdout: true});
      echo(1);
      echo(2);
      console.error(3)
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout, stderr) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, `1\n2\n`);
      assert.equal(stderr, `3\n`);
      assert.equal(fs.readFileSync(outfile).toString(), `1\n2\n3\n`);
      done();
    });
  });

  it(`tees stderr to a file`, (done) => {
    const outfile = `${os.tmpdir()}/stderr-output.log`;
    const code = transform(`
      const t = tee({file: "${outfile}", stderr: true, stdout: false});
      echo(1);
      echo(2);
      console.error(3)
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout, stderr) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, `1\n2\n`);
      assert.equal(stderr, `3\n`);
      assert.equal(fs.readFileSync(outfile).toString(), `3\n`);
      done();
    });
  });

  it(`tees stdout to a file`, (done) => {
    const outfile = `${os.tmpdir()}/stdout-output.log`;
    const code = transform(`
      const t = tee({file: "${outfile}", stderr: false, stdout: true});
      echo(1);
      echo(2);
      console.error(3)
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout, stderr) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, `1\n2\n`);
      assert.equal(stderr, `3\n`);
      assert.equal(fs.readFileSync(outfile).toString(), `1\n2\n`);
      done();
    });
  });

  it(`supresses stdout out`, (done) => {
    const outfile = `${os.tmpdir()}/silent-output.log`;
    const code = transform(`
      const t = tee({file: "${outfile}", stderr: true, stdout: true});
      tee.silent = true;
      echo(1);
      echo(2);
      console.error(3)
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout, stderr) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, ``);
      assert.equal(stderr, ``);
      assert.equal(fs.readFileSync(outfile).toString(), `1\n2\n3\n`);
      done();
    });
  });

  it(`returns a handle that restores previous settings`, (done) => {
    const outfile = `${os.tmpdir()}/reset.log`;
    const code = transform(`
      const t = tee({file: "${outfile}", stderr: true, stdout: true});
      echo(1);
      t.stop();
      echo(2);
      console.error(3)
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout, stderr) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, `1\n2\n`);
      assert.equal(stderr, `3\n`);
      assert.equal(fs.readFileSync(outfile).toString(), `1\n`);
      done();
    });
  });

  it(`can ship subsets of output to multiple files`, (done) => {
    const out1 = `${os.tmpdir()}/1.log`;
    const out2 = `${os.tmpdir()}/2.log`;
    const out3 = `${os.tmpdir()}/3.log`;

    const code = transform(`
      const t1 = tee({file: "${out1}", stderr: true, stdout: true});
      const t2 = tee({file: "${out2}", stderr: true, stdout: true});
      echo(1);
      t1.stop()
      const t3 = tee({file: "${out3}", stderr: true, stdout: true});
      echo(2);
      t2.stop();
      echo(3);
      t3.stop();
      echo(4);
    `);

    cp.exec(`echo '${code}' | node`, (err, stdout) => {
      if (err) {
        done(err);

        return;
      }

      assert.equal(stdout, `1\n2\n3\n4\n`);
      assert.equal(fs.readFileSync(out1).toString(), `1\n`);
      assert.equal(fs.readFileSync(out2).toString(), `1\n2\n`);
      assert.equal(fs.readFileSync(out3).toString(), `2\n3\n`);
      done();
    });
  });
});
