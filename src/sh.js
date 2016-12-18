'use strict';

module.exports = function sh(str, options) {
  options = options || {};
  // we need the require statement inside this function since its going to be
  // stringified
  // eslint-disable-next-line global-require
  const cp = require(`child_process`);

  const spawnOptions = Object.assign({
    std: [`pipe`, `pipe`, `pipe`]
  }, options.spawn);

  return new Promise((resolve, reject) => {
    // Yes, this is weird. we're wrapping a call to bash in a call to bash.
    // Short of reimplementing bash's parser, I don't see a better way to handle
    // quotes, apostrophes, sub-shells, etc.
    const child = cp.spawn(`bash`, [`-c`, str], spawnOptions);

    let out = ``;
    let err = ``;
    if (child.stderr) {
      child.stderr.on(`data`, (d) => {
        err += d;

        process.stderr.write(d.toString());
      });
    }

    if (child.stdout) {
      child.stdout.on(`data`, (d) => {
        out += d;

        process.stdout.write(d.toString());
      });
    }

    child.on(`error`, (error) => {
      reject(error);
    });

    child.on(`close`, (code) => {
      if (options.complex) {
        resolve({
          code,
          stdout: out,
          stderr: err
        });
        return;
      }

      if (code) {
        const e = new Error(err);
        e.code = code;
        e.stdout = out;
        e.stderr = err;
        reject(e);
        return;
      }
      resolve(out);
    });
  });
};
