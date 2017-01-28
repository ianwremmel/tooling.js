'use strict';

const helpers = require(`./helpers`);

const fsMethods = [
  `access`,
  `appendFile`,
  `chmod`,
  `chown`,
  `close`,
  `exists`,
  `fchmod`,
  `fchown`,
  `fdatasync`,
  `fstat`,
  `fsync`,
  `ftruncate`,
  `futimes`,
  `lchmod`,
  `lchown`,
  `link`,
  `lstat`,
  // Note: skipping mkdir so that we can replace it with mkdirp
  // `mkdir`,
  `mkdtemp`,
  `open`,
  `read`,
  `readFile`,
  `readdir`,
  `readlink`,
  `realpath`,
  `rename`,
  `rmdir`,
  `stat`,
  `symlink`,
  `truncate`,
  `unlink`,
  `utimes`,
  `write`,
  `writeFile`
];

module.exports = function plugin({types: t}) {
  /*
   * Utility Functions
   */
  function addHelper(helperName, path, state) {
    if (!state[helperName]) {
      state[helperName] = path.scope.generateUidIdentifier(helperName);
      const helper = helpers[helperName];
      if (!helper) {
        throw new Error(`helper ${helperName} not found`);
      }
      path.scope.getProgramParent().path.unshiftContainer(`body`, helper());
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

  function wrapWithAwait(path) {
    if (!t.isAwaitExpression(path.parentPath)) {
      path.replaceWith(t.awaitExpression(path.node));
    }
  }

  /*
   * transforms
   */
  function addParallel(path, state) {
    addHelper(`parallel`, path, state);
    // Ideally, this would be done with via template, but I couldn't figure
    // out how to get the types to line up.
    const args = path.node.arguments.map((argument) => {
      if (t.isObjectExpression(argument)) {
        return argument;
      }

      if (argument.parallelVisited) {
        return argument;
      }

      if (t.isFunctionExpression(argument) || t.isArrowFunctionExpression(argument)) {
        argument.iife = true;
        argument.params = argument.params || [];
      }
      else {
        argument = t.newExpression(
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
        );
      }

      argument = t.arrowFunctionExpression(
      [],
      t.blockStatement(
        [t.returnStatement(argument)]
      ),
      true
    );

      argument.parallelVisited = true;
      return argument;
    });

    if (!path.replaced) {
      path.replaceWith(
      t.callExpression(
        t.identifier(`parallel`),
        args
      )
    );
      path.replaced = true;
    }
  }

  function addPwd(path, state) {
    if (t.isExpressionStatement(path.parentPath)) {
      addHelper(`printCwd`, path, state);
      path.replaceWith(t.callExpression(
        t.identifier(`printCwd`),
        []
      ));
    }
    else {
      addHelper(`returnCwd`, path, state);
      path.replaceWith(t.callExpression(
        t.identifier(`returnCwd`),
        []
      ));
    }
  }

  function addRetry(path, state) {
    addHelper(`retry`, path, state);
    path.node.arguments = path.node.arguments.map((argument) => {
      if (t.isObjectExpression(argument)) {
        return argument;
      }

      if (argument.params && argument.params.length) {
        const first = argument.params[0];
        if (first.name === `ITERATION`) {
          return argument;
        }
      }

      if (t.isFunctionExpression(argument) || t.isArrowFunctionExpression(argument)) {
        argument.iife = true;
        argument.params = argument.params || [];
        argument.params.unshift(t.identifier(`MAX_ITERATIONS`));
        argument.params.unshift(t.identifier(`ITERATION`));
        return argument;
      }

      return t.arrowFunctionExpression(
        [
          t.identifier(`ITERATION`),
          t.identifier(`MAX_ITERATIONS`)
        ],
          t.blockStatement(
            [t.returnStatement(argument)]
          ),
          true
        );
    });
  }

  function addSh(path, state) {
    addHelper(`sh`, path, state);
  }

  function replaceFsMethod(methodName, path, state) {
    addHelper(`fs`, path, state);
    replaceFunction(`fs`, methodName, path);
    wrapWithAwait(path);
  }

  return {
    visitor: {
      MemberExpression(path) {
        if (path.node.object.name === `env` && !t.isMemberExpression(path.parentPath.node)) {
          path.replaceWith(
            t.memberExpression(
              t.memberExpression(
                t.identifier(`process`),
                t.identifier(`env`)
              ),
              path.node.property
            )
          );
        }
      },
      // eslint-disable-next-line complexity
      CallExpression(path, state) {
        if (path.get(`callee`).isIdentifier({name: `cd`})) {
          replaceFunction(`process`, `chdir`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `echo`})) {
          replaceFunction(`console`, `log`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `exit`})) {
          replaceFunction(`process`, `exit`, path);
        }
        else if (path.get(`callee`).isIdentifier({name: `parallel`})) {
          addParallel(path, state);
          wrapWithAwait(path);
        }
        if (path.get(`callee`).isIdentifier({name: `pwd`})) {
          addPwd(path, state);
        }
        else if (path.get(`callee`).isIdentifier({name: `retry`})) {
          addRetry(path, state);
          wrapWithAwait(path);
        }
        else if (path.get(`callee`).isIdentifier({name: `sh`})) {
          addSh(path, state);
          wrapWithAwait(path);
        }
        else if (path.get(`callee`).isIdentifier({name: `tee`})) {
          addHelper(`tee`, path, state);
        }
        else if (path.get(`callee`).isIdentifier({name: `readJSON`})) {
          addHelper(`readJSON`, path, state);
          wrapWithAwait(path);
        }
        else if (path.get(`callee`).isIdentifier({name: `mkdir`})) {
          addHelper(`mkdir`, path, state);
        }
        else {
          fsMethods.forEach((methodName) => {
            if (path.get(`callee`).isIdentifier({name: methodName})) {
              if (methodName === `readFile` && path.node.arguments.length === 1) {
                path.node.arguments.push(t.stringLiteral(`utf8`));
              }
              replaceFsMethod(methodName, path, state);
            }
          });
        }
      }
    }
  };
};
