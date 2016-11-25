const sh = require(`./sh`);
const template = require(`babel-template`);

const shTemplate = template(`async ${sh.toString()}`);

function replaceFunction(t, object, property, path) {
  path.replaceWith(t.callExpression(
    t.memberExpression(
      t.identifier(object), t.identifier(property)
    ),
    path.node.arguments
  ));
}

function addGlobal(path, global) {
  while (path.parentPath && path.parentPath.parentPath) {
    path = path.parentPath;
  }

  path.insertAfter(global);
}

module.exports = function plugin({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.get(`callee`).isIdentifier({name: `echo`})) {
          replaceFunction(t, `console`, `log`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `sh`})) {
          addGlobal(path, shTemplate());
          path.replaceWith(t.awaitExpression(path.node));
          path.skip();
        }
      }
    }
  };
};
