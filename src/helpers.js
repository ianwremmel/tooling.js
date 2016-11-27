"use strict";

const sh = require(`./sh`);
const template = require(`babel-template`);

module.exports = {
  parallel: template(`
    async function parallel(...args) {
      return await Promise.all(args);
    };
  `),

  sh: template(sh.toString())
};
