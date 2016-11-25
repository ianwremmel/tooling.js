const sh = require(`./sh`);
const template = require(`babel-template`);

const shTemplate = template(`const sh = async ${sh.toString()}`);

function replaceFunction(t, object, property, path) {
  path.replaceWith(t.callExpression(
    t.memberExpression(
      t.identifier(object), t.identifier(property)
    ),
    path.node.arguments
  ));
}

module.exports = function plugin({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.get(`callee`).isIdentifier({name: `echo`})) {
          replaceFunction(t, `console`, `log`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `sh`})) {
          // TODO wrap path in IIFE
          path.insertBefore(shTemplate());
          path.replaceWith(t.awaitExpression(path.node));
          path.skip();
        }
      }
    }
  };
};
