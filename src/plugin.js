module.exports = function({types: t}) {
  return {
    visitor: {
      CallExpression(path, state) {
        console.log(path);
      }
    }
  };
};
