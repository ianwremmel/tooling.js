"use strict";

const sh = require(`./sh`);
const tee = require(`./helpers/tee`);
const template = require(`babel-template`);

module.exports = {
  fs: template(`
    const fs = require('mz/fs');
  `),

  mkdir: template(`
    const mkdir = require('mkdirp');
  `),

  parallel: template(`
    async function parallel(options, ...args) {
      if (typeof options !== "object") {
        args.unshift(options);
        options = {};
      }

      let max = options.concurrency;

      if (!max) {
        // return Promise.all(args);
        max = args.length;
      }

      const results = [];
      const iter = makeIterator();

      const promises = [];
      for (let i = 0; i < max; i++) {
        promises.push(tick());
      }

      await Promise.all(promises);
      return results;

      function* makeIterator() {
        for (let i = 0; i < args.length; i++) {
          yield invoke(args[i], i);
        }
      }

      async function invoke(arg, i) {
        results[i] = await arg();
      }

      async function tick() {
        const next = iter.next();
        if (next.done) {
          return null;
        }

        await next.value;
        try {
          const ret = await tick();
          return ret;
        }
        catch (reason) {
          console.error(reason);
          throw reason;
        }
      }
    };
  `),

  printCwd: template(`
    function printCwd() {
      echo(process.cwd());
    }
  `),

  readJSON: template(`
    async function readJSON(filename) {
      return JSON.parse(await readFile(filename));
    }
  `),

  returnCwd: template(`
    function returnCwd() {
      return process.cwd();
    }
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
          await action(i, options.max);
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

  sh: template(sh.toString()),

  tee: template(tee.toString())
};
