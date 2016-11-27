const sh = require(`./sh`);
const template = require(`babel-template`);

module.exports = function plugin({types: t}) {
  const shtpl = template(sh.toString());
  const paralleltpl = template(`
    async function parallel(...args) {
      return await Promise.all(args);
    };
  `);

  function addSh(path, state) {
    if (!state.sh) {
      state.sh = path.scope.generateUidIdentifier(`sh`);
      const helper = shtpl();
      path.scope.getProgramParent().path.unshiftContainer(`body`, helper);
    }
  }

  function addParallel(path, state) {
    if (!state.parallel) {
      state.parallel = path.scope.generateUidIdentifier(`parallel`);
      const helper = paralleltpl();
      // Ideally, this would be done with via template, but I couldn't figure
      // out how to get the types to line up.
      const args = path.node.arguments.map((argument) => t.newExpression(
        t.identifier(`Promise`),
        [t.arrowFunctionExpression(
          [t.identifier(`resolve`)],
          t.callExpression(
            t.identifier(`resolve`),
            [argument]
          ),
          // make it async:
          true
        )]
      ));

      path.replaceWith(
        t.callExpression(
          t.identifier(`parallel`),
          args
        )
      );
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
        else if (path.get(`callee`).isIdentifier({name: `parallel`})) {
          addParallel(path, state);
        }
      }
    }
  };
};
