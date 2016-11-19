import assert from 'assert';
import cp from 'child_process';
import path from 'path';

cp.exec(`bin/tooling ./test/unit/fixtures/example.js`, {
  // cwd: path.resolve(__dirname, `../../..`)
}, (error, stdout, stderr) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  assert.equal(stdout, `1\n2\n3\n4`);
})
