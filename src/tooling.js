'use strict';

const fs = require(`fs`);
const path = require(`path`);
const transform = require(`./transform`);

const nodeModulePatern = /node_modules/;
function isNodeModule(filename) {
  return nodeModulePatern.test(filename);
}

function inject(m, filename) {
  const code = fs.readFileSync(filename, `utf8`);
  // This isn't quite the right place to do this; we really only want to exit if
  // the file being transformed is the entry point
  m._compile(transform(code, {exit: true}), filename);
}

function enable() {
  let dir;
  const load = require.extensions[`.js`];
  require.extensions[`.js`] = function transformOnLoad(m, filename) {
    if (isNodeModule(filename)) {
      return load(m, filename);
    }

    if (!dir) {
      dir = path.dirname(filename);
    }

    if (!filename.includes(dir)) {
      return load(m, filename);
    }

    return inject(m, filename);
  };
}

enable();
