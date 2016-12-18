'use strict';

module.exports = function tee(options) {
  if (!tee.streams) {
    // eslint-disable-next-line global-require
    tee.fs = require(`fs`);

    tee.processStreams = {
      stderr: process.stderr.write,
      stdout: process.stdout.write
    };

    tee.streams = {
      stderr: new Set(),
      stdout: new Set()
    };

    [
      `stderr`,
      `stdout`
    ].forEach((key) => {
      tee[key] = (...args) => {
        if (!tee.silent) {
          Reflect.apply(tee.processStreams[key], process[key], args);
        }
        for (const stream of tee.streams[key]) {
          stream.write(...args);
        }
      };

      process[key].write = tee[key];
    });

  }

  options = Object.assign({
    stderr: false,
    stdout: false
  }, options);

  const stream = options.stream || tee.fs.createWriteStream(options.file);
  [
    `stderr`,
    `stdout`
  ].forEach((key) => {
    if (options[key]) {
      tee.streams[key].add(stream);
    }
  });

  return {
    stop() {
      [`stderr`, `stdout`].forEach((key) => {
        tee.streams[key].delete(stream);
      });
    }
  };

};
