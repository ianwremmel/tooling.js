const babel = require(`babel-core`);
const babelPluginTransformTooling = require(`./plugin`);

module.exports = function transform(code) {
  // Need to wrap in `async function()` so that babylon doesn't fail during the
  // parse phase
  return babel.transform(`(async function() {${code}}())`, {
    plugins: [
      babelPluginTransformTooling
    ],
    presets: [
      [`env`, {
        targets: {
          node: true
        }
      }]
    ]
  }).code;
};
