'use strict';

const babel = require(`babel-core`);
const babelPluginTransformTooling = require(`./plugin`);

/**
 * Determines if the specified variable is a number
 * @param {mixed} n
 * @private
 * @returns {Boolean}
 */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Wraps code in an async IIFE when appropriate. Uses regex instead of babel
 * because I haven't figured out how to extend Babylon. This means that all
 * import statements must come before any potentially async code.
 * @param {string} code
 * @private
 * @returns {string}
 */
function asyncWrap(code) {
  // Note: Had to add \s* because of the way template litterals are written in
  // tests
  const EXPORT_PATTERN = /^\s*export/gm;
  const IMPORT_PATTERN = /^\s*import/gm;
  const SINGLE_LINE_IMPORT_PATTERN = /^\s*import.*['"];?$/gm;
  const END_OF_IMPORT_PATTERN = /['"];?/gm;

  // exports are too complex without doing aggresive transformations (that won't
  // parse without modifying babylon), so we'll just assume that people using
  // export know what they're doing. We probably should do the same thing for
  // module.exports, but I think it's ok because of the nature of node.
  if (!EXPORT_PATTERN.test(code)) {
    let lastImport = null;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = IMPORT_PATTERN.exec(code)) !== null) {
      lastImport = match.index;
    }

    if (isNumber(lastImport)) {
      let splitPoint = lastImport;
      if (SINGLE_LINE_IMPORT_PATTERN.exec(code.substr(lastImport))) {
        splitPoint += SINGLE_LINE_IMPORT_PATTERN.lastIndex;
      }
      else {
        for (let i = 0; i < 2; i++) {
          END_OF_IMPORT_PATTERN.exec(code.substr(lastImport));
        }
        splitPoint += END_OF_IMPORT_PATTERN.lastIndex;
      }
      const importBlock = code.substr(0, splitPoint);
      const codeBlock = code.substr(splitPoint);
      code = `${importBlock}\n(async function() { ${codeBlock} })()`;
    }
    else {
      return `(async function() { ${code} })()`;
    }
  }

  return code;
}

module.exports = function transform(code) {
  code = asyncWrap(code);
  // The following two transforms should be doable in one step, but because sh
  // uses insertBefore, there's `async` code that doesn't changed to `yield`.

  // Apply our transforms
  code = babel.transform(code, {
    plugins: [
      babelPluginTransformTooling
    ]
  }).code;

  if (process.env.LOG_INTERMEDIATE) {
    // eslint-disable-next-line no-console
    console.info(code);
  }

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
