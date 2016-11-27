"use strict";

const babel = require(`babel-core`);
const babelPluginTransformTooling = require(`./plugin`);

module.exports = function transform(code) {
  // wrap code in an async iife so that babylon can handle use of the `async`
  // keyword
  code = `(async function() { ${code} })()`;

  // The following two transforms should be doable in one step, but because sh
  // uses insertBefore, there's `async` code that doesn't changed to `yield`.

  // Apply our transforms
  code = babel.transform(code, {
    plugins: [
      babelPluginTransformTooling
    ]
  }).code;

  // Apply env-required transforms - this is done as two different steps to make
  // sure our transforms happen first
  code = babel.transform(code, {
    presets: [
      [`env`, {
        targets: {
          node: true
        }
      }]
    ]
  }).code;

  return code;
};
