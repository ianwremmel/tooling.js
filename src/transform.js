const babel = require(`babel-core`);
const babelPluginTransformTooling = require(`./plugin`);

module.exports = function transform(code) {
  return babel.transform(code, {
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
