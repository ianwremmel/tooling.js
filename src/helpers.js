"use strict";

const sh = require(`./sh`);
const template = require(`babel-template`);

module.exports = {
  parallel: template(`
    async function parallel(...args) {
      return await Promise.all(args);
    };
  `),

  retry: template(`
    async function retry(options, action) {
      if (!action) {
        action = options;
        options = {};
      }

      options.max = options.max || 3;

      let result;

      for (let i = 0; i < options.max; i++) {
        try {
          result = null;
          await action();
          if (!options.repeat) {
            break;
          }
        }
        catch (err) {
          result = err;
        }
      }
      if (result) {
        throw result;
      }
    }
  `),

  sh: template(sh.toString())
};
