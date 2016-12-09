"use strict";

const helpers = require(`./helpers`);

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
    if (t.isExpressionStatement(path.parentPath)) {
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

  return {
    visitor: {
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
      }
    }
  };
};
