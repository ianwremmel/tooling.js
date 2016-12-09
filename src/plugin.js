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

  function wrapWithAwait(path) {
    if (!t.isAwaitExpression(path.parentPath)) {
      path.replaceWith(t.awaitExpression(path.node));
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

  /*
   * transforms
   */
  function addSh(path, state) {
    if (!state.sh) {
      state.sh = path.scope.generateUidIdentifier(`sh`);
      const helper = helpers.sh();
      path.scope.getProgramParent().path.unshiftContainer(`body`, helper);
    }
  }

  function addParallel(path, state) {
    if (!state.parallel) {
      state.parallel = path.scope.generateUidIdentifier(`parallel`);
      const helper = helpers.parallel();
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
    if (!state.retry) {
      state.retry = path.scope.generateUidIdentifier(`retry`);
      const helper = helpers.retry();

      path.node.arguments = path.node.arguments.map((argument) => {
        if (t.isObjectExpression(argument)) {
          return argument;
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

      path.scope.getProgramParent().path.unshiftContainer(`body`, helper);
    }
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
