const sh = require(`./sh`);
const template = require(`babel-template`);

module.exports = function plugin({types: t}) {
  const shtpl = template(sh.toString());

  function addSh(path, state) {
    if (!state.sh) {
      state.sh = path.scope.generateUidIdentifier(`sh`);
      const helper = shtpl();
      path.scope.getProgramParent().path.unshiftContainer(`body`, helper);
    }
  }

  function replaceFunction(object, property, path) {
    path.replaceWith(t.callExpression(
      t.memberExpression(
        t.identifier(object), t.identifier(property)
      ),
      path.node.arguments
    ));
  }

  return {
    visitor: {
      CallExpression(path, state) {
        if (path.get(`callee`).isIdentifier({name: `echo`})) {
          replaceFunction(`console`, `log`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `sh`})) {
          addSh(path, state);
          path.replaceWith(t.awaitExpression(path.node));
          // Stop descending to prevent the recursion caused by adding the
          // awaitExpression
          path.skip();
        }
      }
    }
  };
};
