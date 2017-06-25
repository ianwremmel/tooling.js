'use strict';

module.exports = function sh(str, options = {}) {
  let {x} = sh;
  if (`x` in options) {
    // the next assignment can't, as far as I can tell, be destructured
    // eslint-disable-next-line prefer-destructuring
    x = options.x;
  }

  // we need the require statement inside this function since its going to be
  // stringified
  // eslint-disable-next-line global-require
  const cp = require(`child_process`);

  const spawnOptions = Object.assign({stdio: [`pipe`, `pipe`, `pipe`]}, options.spawn);

  return new Promise((resolve, reject) => {
    // Yes, this is weird. we're wrapping a call to bash in a call to bash.
    // Short of reimplementing bash's parser, I don't see a better way to handle
    // quotes, apostrophes, sub-shells, etc.
    const child = cp.spawn(`bash`, [`-c`, str], spawnOptions);
    if (x) {
      // eslint-disable-next-line no-console
      console.info(str);
    }

    let out = ``;
    let err = ``;
    let all = ``;
    if (child.stderr) {
      child.stderr.on(`data`, (d) => {
        err += d;
        all += d;
        process.stderr.write(d);
      });
    }

    if (child.stdout) {
      child.stdout.on(`data`, (d) => {
        out += d;
        all += d;
        process.stdout.write(d);
      });
    }

    child.on(`error`, (error) => {
      reject(error);
    });

    child.on(`close`, (code) => {
      if (options.complex) {
        resolve({
          code,
          stderr: err,
          stdout: out
        });

        return;
      }

      if (code) {
        process.stderr.write(`${all}\n`);
        const e = new Error(err);
        e.code = code;
        e.stdout = out;
        e.stderr = err;
        e.all = all;
        reject(e);

        return;
      }
      resolve(out);
    });
  });
};
