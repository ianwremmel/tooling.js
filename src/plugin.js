function replaceFunction(t, object, property, path) {
  path.replaceWith(t.callExpression(
    t.memberExpression(
      t.identifier(object), t.identifier(property)
    ),
    path.node.arguments
  ));
}

module.exports = function({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.get(`callee`).isIdentifier({name: `echo`})) {
          replaceFunction(t, `console`, `log`, path);
        }
      }
    }
  };
};
